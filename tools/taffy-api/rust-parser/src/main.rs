use quote::ToTokens;
use serde::Serialize;
use serde_json::{Map, Value, json};
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use syn::visit_mut::{self, VisitMut};
use syn::{
    Attribute, Fields, FnArg, GenericParam, Generics, ImplItem, Item, ItemEnum, ItemImpl,
    ItemStruct, Meta, Signature, Type, Visibility, parse_quote,
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ParserOutput {
    parser: &'static str,
    taffy_root: String,
    file_features: BTreeMap<String, Vec<String>>,
    file_cfg: BTreeMap<String, Value>,
    inherent_impl_matches: bool,
    inherent_method_duplicates: Vec<String>,
    inherent_methods: BTreeMap<String, MethodOutput>,
    trait_impl_matches: bool,
    trait_method_duplicates: Vec<String>,
    trait_methods: BTreeMap<String, MethodOutput>,
    adjacent_roots: Vec<AdjacentRootOutput>,
    named_data: BTreeMap<String, NamedDataOutput>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MethodOutput {
    normalized_signature: String,
    expected_normalized_signature: Option<String>,
    signature_matches: bool,
    cfg: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AdjacentRootOutput {
    kind: String,
    name: String,
    source: String,
    matches: bool,
    detail: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NamedDataOutput {
    source: String,
    kind: String,
    effective_features: Vec<String>,
    effective_cfg: Value,
    shape_matches: bool,
    actual_shape: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ContractTestOutput {
    identity: String,
    is_test: bool,
    forbidden_attribute: bool,
}

#[derive(Default)]
struct IdentRenamer {
    identifiers: HashMap<String, String>,
    lifetimes: HashMap<String, String>,
}

impl VisitMut for IdentRenamer {
    fn visit_ident_mut(&mut self, ident: &mut syn::Ident) {
        if let Some(replacement) = self.identifiers.get(&ident.to_string()) {
            *ident = syn::Ident::new(replacement, ident.span());
        }
    }

    fn visit_lifetime_mut(&mut self, lifetime: &mut syn::Lifetime) {
        if let Some(replacement) = self.lifetimes.get(&lifetime.ident.to_string()) {
            lifetime.ident = syn::Ident::new(replacement, lifetime.ident.span());
        }
        visit_mut::visit_lifetime_mut(self, lifetime);
    }
}

fn renamer_for(generics: &Generics) -> IdentRenamer {
    let mut renamer = IdentRenamer::default();
    let mut type_index = 0usize;
    let mut lifetime_index = 0usize;
    let mut const_index = 0usize;
    for parameter in &generics.params {
        match parameter {
            GenericParam::Type(parameter) => {
                renamer
                    .identifiers
                    .insert(parameter.ident.to_string(), format!("T{type_index}"));
                type_index += 1;
            }
            GenericParam::Lifetime(parameter) => {
                renamer.lifetimes.insert(
                    parameter.lifetime.ident.to_string(),
                    format!("L{lifetime_index}"),
                );
                lifetime_index += 1;
            }
            GenericParam::Const(parameter) => {
                renamer
                    .identifiers
                    .insert(parameter.ident.to_string(), format!("C{const_index}"));
                const_index += 1;
            }
        }
    }
    renamer
}

fn token_string<T: ToTokens>(value: &T) -> String {
    value.to_token_stream().to_string()
}

fn normalize_signature(signature: &Signature) -> String {
    let mut normalized = signature.clone();
    for input in &mut normalized.inputs {
        if let FnArg::Typed(typed) = input {
            *typed.pat = parse_quote!(_);
        }
    }
    if normalized.inputs.trailing_punct() {
        normalized.inputs.pop_punct();
    }
    if let Some(where_clause) = &mut normalized.generics.where_clause
        && where_clause.predicates.trailing_punct()
    {
        where_clause.predicates.pop_punct();
    }
    let mut renamer = renamer_for(&normalized.generics);
    renamer.visit_signature_mut(&mut normalized);
    token_string(&normalized)
}

fn normalize_type(ty: &Type, generics: &Generics) -> String {
    let mut normalized = ty.clone();
    let mut renamer = renamer_for(generics);
    renamer.visit_type_mut(&mut normalized);
    token_string(&normalized).replace(
        "crate :: compute :: grid :: DetailedGridInfo",
        "DetailedGridInfo",
    )
}

fn normalize_generics(generics: &Generics) -> Vec<String> {
    let mut normalized = generics.clone();
    let mut renamer = renamer_for(&normalized);
    renamer.visit_generics_mut(&mut normalized);
    normalized.params.iter().map(token_string).collect()
}

fn read_json(path: &Path) -> Result<Value, String> {
    let source = fs::read_to_string(path)
        .map_err(|error| format!("failed to read {}: {error}", path.display()))?;
    serde_json::from_str(&source)
        .map_err(|error| format!("failed to parse {}: {error}", path.display()))
}

fn parse_rust_file(path: &Path) -> Result<syn::File, String> {
    let source = fs::read_to_string(path)
        .map_err(|error| format!("failed to read {}: {error}", path.display()))?;
    syn::parse_file(&source)
        .map_err(|error| format!("failed to parse {} with syn: {error}", path.display()))
}

fn feature_from_meta(meta: &Meta) -> Option<String> {
    match meta {
        Meta::NameValue(name_value) if name_value.path.is_ident("feature") => {
            if let syn::Expr::Lit(expression) = &name_value.value
                && let syn::Lit::Str(value) = &expression.lit
            {
                return Some(value.value());
            }
            None
        }
        _ => None,
    }
}

fn cfg_meta_value(meta: &Meta) -> Value {
    if let Some(feature) = feature_from_meta(meta) {
        return json!({ "feature": feature });
    }
    match meta {
        Meta::Path(path) if path.is_ident("true") => Value::Bool(true),
        Meta::List(list)
            if list.path.is_ident("all")
                || list.path.is_ident("any")
                || list.path.is_ident("not") =>
        {
            let nested = list
                .parse_args_with(
                    syn::punctuated::Punctuated::<Meta, syn::Token![,]>::parse_terminated,
                )
                .map(|items| items.iter().map(cfg_meta_value).collect::<Vec<_>>())
                .unwrap_or_else(|_| vec![json!({ "unparsed": token_string(list) })]);
            let key = if list.path.is_ident("all") {
                "all"
            } else if list.path.is_ident("any") {
                "any"
            } else {
                "not"
            };
            if key == "not" && nested.len() == 1 {
                json!({ key: nested[0] })
            } else {
                json!({ key: nested })
            }
        }
        _ => json!({ "unparsed": token_string(meta) }),
    }
}

fn cfg_value(attributes: &[Attribute]) -> Value {
    let values = attributes
        .iter()
        .filter(|attribute| attribute.path().is_ident("cfg"))
        .map(|attribute| {
            attribute
                .parse_args::<Meta>()
                .map(|meta| cfg_meta_value(&meta))
                .unwrap_or_else(|_| json!({ "unparsed": token_string(attribute) }))
        })
        .collect::<Vec<_>>();
    normalize_cfg(match values.as_slice() {
        [] => Value::Bool(true),
        [only] => only.clone(),
        _ => json!({ "all": values }),
    })
}

fn normalize_cfg(value: Value) -> Value {
    let Value::Object(mut object) = value else {
        return value;
    };
    for key in ["all", "any"] {
        if let Some(Value::Array(values)) = object.remove(key) {
            let mut normalized = values
                .into_iter()
                .map(normalize_cfg)
                .flat_map(|value| match value {
                    Value::Object(mut nested) => match nested.remove(key) {
                        Some(Value::Array(values)) if nested.is_empty() => values,
                        _ => vec![Value::Object(nested)],
                    },
                    value => vec![value],
                })
                .collect::<Vec<_>>();
            if key == "all" {
                normalized.retain(|value| value != &Value::Bool(true));
            }
            normalized.sort_by_key(|value| serde_json::to_string(value).unwrap_or_default());
            return match normalized.as_slice() {
                [] => Value::Bool(key == "all"),
                [only] => only.clone(),
                _ => json!({ key: normalized }),
            };
        }
    }
    if let Some(value) = object.remove("not") {
        return json!({ "not": normalize_cfg(value) });
    }
    Value::Object(object)
}

fn combine_cfg(values: impl IntoIterator<Item = Value>) -> Value {
    normalize_cfg(json!({ "all": values.into_iter().collect::<Vec<_>>() }))
}

fn cfg_from_features(features: &[String]) -> Value {
    combine_cfg(features.iter().map(|feature| json!({ "feature": feature })))
}

fn cfg_features(value: &Value) -> Vec<String> {
    fn visit(value: &Value, features: &mut BTreeSet<String>) {
        match value {
            Value::Object(object) => {
                if let Some(Value::String(feature)) = object.get("feature") {
                    features.insert(feature.clone());
                }
                object.values().for_each(|value| visit(value, features));
            }
            Value::Array(values) => values.iter().for_each(|value| visit(value, features)),
            _ => {}
        }
    }
    let mut features = BTreeSet::new();
    visit(value, &mut features);
    features.into_iter().collect()
}

fn resolve_module_file(current: &Path, module: &syn::ItemMod) -> Option<PathBuf> {
    for attribute in &module.attrs {
        if attribute.path().is_ident("path")
            && let Meta::NameValue(value) = &attribute.meta
            && let syn::Expr::Lit(expression) = &value.value
            && let syn::Lit::Str(path) = &expression.lit
        {
            return current.parent().map(|parent| parent.join(path.value()));
        }
    }
    let parent = current.parent()?;
    let module_name = module.ident.to_string();
    let base = if matches!(
        current.file_name().and_then(|name| name.to_str()),
        Some("lib.rs" | "main.rs" | "mod.rs")
    ) {
        parent.to_path_buf()
    } else {
        parent.join(current.file_stem()?)
    };
    let direct = base.join(format!("{module_name}.rs"));
    if direct.is_file() {
        Some(direct)
    } else {
        let nested = base.join(module_name).join("mod.rs");
        nested.is_file().then_some(nested)
    }
}

fn collect_file_cfg(
    root: &Path,
    current: &Path,
    inherited: &Value,
    output: &mut BTreeMap<String, Value>,
    visited: &mut HashSet<PathBuf>,
) -> Result<(), String> {
    let canonical = current
        .canonicalize()
        .map_err(|error| format!("failed to resolve {}: {error}", current.display()))?;
    if !visited.insert(canonical.clone()) {
        return Ok(());
    }
    let relative = canonical
        .strip_prefix(root)
        .map_err(|_| format!("{} is outside {}", canonical.display(), root.display()))?
        .to_string_lossy()
        .replace('\\', "/");
    let file = parse_rust_file(&canonical)?;
    let effective_file_cfg = combine_cfg([inherited.clone(), cfg_value(&file.attrs)]);
    output.insert(relative, effective_file_cfg.clone());
    for item in file.items {
        if let Item::Mod(module) = item
            && module.content.is_none()
            && let Some(path) = resolve_module_file(&canonical, &module)
        {
            let effective = combine_cfg([effective_file_cfg.clone(), cfg_value(&module.attrs)]);
            collect_file_cfg(root, &path, &effective, output, visited)?;
        }
    }
    Ok(())
}

fn owned_type_name(ty: &Type) -> Option<String> {
    if let Type::Path(path) = ty {
        path.path
            .segments
            .last()
            .map(|segment| segment.ident.to_string())
    } else {
        None
    }
}

fn trait_name(item_impl: &ItemImpl) -> Option<String> {
    item_impl
        .trait_
        .as_ref()
        .and_then(|(_, path, _)| path.segments.last())
        .map(|segment| segment.ident.to_string())
}

fn parse_expected_signature(value: &str) -> Option<Signature> {
    syn::parse_str::<Signature>(value).ok()
}

fn method_outputs(
    item_impls: &[&ItemImpl],
    expected_methods: &Map<String, Value>,
    file_cfg: &Value,
) -> (BTreeMap<String, MethodOutput>, Vec<String>) {
    let mut output = BTreeMap::new();
    let mut duplicates = BTreeSet::new();
    for item_impl in item_impls {
        let impl_cfg = combine_cfg([file_cfg.clone(), cfg_value(&item_impl.attrs)]);
        for item in &item_impl.items {
            let ImplItem::Fn(method) = item else {
                continue;
            };
            if item_impl.trait_.is_none() && !matches!(method.vis, Visibility::Public(_)) {
                continue;
            }
            let name = method.sig.ident.to_string();
            let expected = expected_methods
                .get(&name)
                .and_then(|value| value.get("signature"))
                .and_then(Value::as_str)
                .and_then(parse_expected_signature);
            let normalized = normalize_signature(&method.sig);
            let expected_normalized = expected.as_ref().map(normalize_signature);
            let signature_matches = expected_normalized
                .as_ref()
                .is_some_and(|value| value == &normalized);
            let previous = output.insert(
                name,
                MethodOutput {
                    normalized_signature: normalized,
                    expected_normalized_signature: expected_normalized,
                    signature_matches,
                    cfg: combine_cfg([impl_cfg.clone(), cfg_value(&method.attrs)]),
                },
            );
            if previous.is_some() {
                duplicates.insert(method.sig.ident.to_string());
            }
        }
    }
    (output, duplicates.into_iter().collect())
}

fn normalize_impl_header(item_impl: &ItemImpl) -> String {
    let mut normalized = item_impl.clone();
    normalized.attrs.clear();
    normalized.items.clear();
    let mut renamer = renamer_for(&normalized.generics);
    renamer.visit_item_impl_mut(&mut normalized);
    token_string(&normalized)
}

fn expected_impl_header(value: &str) -> Option<String> {
    syn::parse_str::<ItemImpl>(value)
        .ok()
        .map(|item| normalize_impl_header(&item))
}

fn find_impls<'a>(
    file: &'a syn::File,
    self_name: &str,
    wanted_trait: Option<&str>,
) -> Vec<&'a ItemImpl> {
    file.items
        .iter()
        .filter_map(|item| {
            let Item::Impl(item_impl) = item else {
                return None;
            };
            if owned_type_name(&item_impl.self_ty).as_deref() != Some(self_name) {
                return None;
            }
            if trait_name(item_impl).as_deref() == wanted_trait {
                Some(item_impl)
            } else {
                None
            }
        })
        .collect()
}

fn expected_generics(shape: &Value) -> Vec<String> {
    let Some(values) = shape.get("generics").and_then(Value::as_array) else {
        return Vec::new();
    };
    let source = values
        .iter()
        .filter_map(Value::as_str)
        .collect::<Vec<_>>()
        .join(", ");
    let parsed = syn::parse_str::<ItemStruct>(&format!("struct Expected<{source}>;")).ok();
    parsed
        .as_ref()
        .map(|item| normalize_generics(&item.generics))
        .unwrap_or_default()
}

fn expected_type(value: &Value, generics: &Generics) -> Option<String> {
    let source = value.as_str()?;
    syn::parse_str::<Type>(source)
        .ok()
        .map(|ty| normalize_type(&ty, generics))
}

fn named_fields_shape(fields: &Fields, generics: &Generics) -> Value {
    let mut output = Map::new();
    if let Fields::Named(fields) = fields {
        for field in &fields.named {
            if matches!(field.vis, Visibility::Public(_)) {
                let name = field.ident.as_ref().expect("named field").to_string();
                output.insert(name, Value::String(normalize_type(&field.ty, generics)));
            }
        }
    }
    Value::Object(output)
}

fn field_cfg_shape(fields: &Fields) -> Value {
    let mut output = Map::new();
    if let Fields::Named(fields) = fields {
        for field in &fields.named {
            if matches!(field.vis, Visibility::Public(_)) {
                let cfg = cfg_value(&field.attrs);
                if cfg != Value::Bool(true) {
                    output.insert(field.ident.as_ref().expect("named field").to_string(), cfg);
                }
            }
        }
    }
    Value::Object(output)
}

fn normalize_cfg_map(value: Value) -> Value {
    match value {
        Value::Object(values) => Value::Object(
            values
                .into_iter()
                .map(|(name, cfg)| (name, normalize_cfg(cfg)))
                .collect(),
        ),
        value => value,
    }
}

fn variant_shape(item: &ItemEnum) -> (Value, Value) {
    let mut variants = Map::new();
    let mut cfg = Map::new();
    for variant in &item.variants {
        let name = variant.ident.to_string();
        let payload = match &variant.fields {
            Fields::Unit => Value::Null,
            Fields::Unnamed(fields) => Value::Array(
                fields
                    .unnamed
                    .iter()
                    .map(|field| Value::String(normalize_type(&field.ty, &item.generics)))
                    .collect(),
            ),
            Fields::Named(fields) => Value::Object(
                fields
                    .named
                    .iter()
                    .map(|field| {
                        (
                            field
                                .ident
                                .as_ref()
                                .expect("named variant field")
                                .to_string(),
                            Value::String(normalize_type(&field.ty, &item.generics)),
                        )
                    })
                    .collect(),
            ),
        };
        variants.insert(name.clone(), payload);
        let value = cfg_value(&variant.attrs);
        if value != Value::Bool(true) {
            cfg.insert(name, value);
        }
    }
    (Value::Object(variants), Value::Object(cfg))
}

fn normalize_expected_field_map(shape: &Value, key: &str, generics: &Generics) -> Value {
    let mut output = Map::new();
    if let Some(fields) = shape.get(key).and_then(Value::as_object) {
        for (name, value) in fields {
            let normalized = expected_type(value, generics)
                .unwrap_or_else(|| format!("<invalid expected type: {value}>"));
            output.insert(name.clone(), Value::String(normalized));
        }
    }
    Value::Object(output)
}

fn normalize_expected_variants(shape: &Value, generics: &Generics) -> Value {
    let mut output = Map::new();
    if let Some(variants) = shape.get("variants").and_then(Value::as_object) {
        for (name, payload) in variants {
            let value = match payload {
                Value::Null => Value::Null,
                Value::Array(values) => Value::Array(
                    values
                        .iter()
                        .map(|value| {
                            Value::String(
                                expected_type(value, generics)
                                    .unwrap_or_else(|| format!("<invalid expected type: {value}>")),
                            )
                        })
                        .collect(),
                ),
                Value::Object(fields) => Value::Object(
                    fields
                        .iter()
                        .map(|(field, value)| {
                            (
                                field.clone(),
                                Value::String(expected_type(value, generics).unwrap_or_else(
                                    || format!("<invalid expected type: {value}>"),
                                )),
                            )
                        })
                        .collect(),
                ),
                _ => Value::String("<invalid expected variant>".to_string()),
            };
            output.insert(name.clone(), value);
        }
    }
    Value::Object(output)
}

fn shape_for_item(item: &Item, expected: &Value) -> (String, Value, bool) {
    match item {
        Item::Struct(item_struct) => {
            let is_public = matches!(item_struct.vis, Visibility::Public(_));
            let actual_generics = normalize_generics(&item_struct.generics);
            let wanted_generics = expected_generics(expected);
            let expected_kind = expected.get("kind").and_then(Value::as_str).unwrap_or("");
            if expected_kind == "opaqueTupleStruct" {
                let (is_tuple, public_fields) = match &item_struct.fields {
                    Fields::Unnamed(fields) => (
                        true,
                        fields
                            .unnamed
                            .iter()
                            .enumerate()
                            .filter(|(_, field)| matches!(field.vis, Visibility::Public(_)))
                            .map(|(index, field)| {
                                json!({
                                    "index": index,
                                    "type": normalize_type(&field.ty, &item_struct.generics),
                                })
                            })
                            .collect::<Vec<_>>(),
                    ),
                    _ => (false, Vec::new()),
                };
                let actual = json!({
                    "kind": "opaqueTupleStruct",
                    "generics": actual_generics,
                    "publicFields": public_fields.clone(),
                });
                let expected_public_fields = expected
                    .get("publicFields")
                    .and_then(Value::as_array)
                    .cloned()
                    .unwrap_or_default();
                let matches = is_tuple
                    && is_public
                    && wanted_generics == actual_generics
                    && public_fields == expected_public_fields;
                ("opaqueTupleStruct".to_string(), actual, matches)
            } else {
                let fields = named_fields_shape(&item_struct.fields, &item_struct.generics);
                let field_cfg = field_cfg_shape(&item_struct.fields);
                let expected_fields =
                    normalize_expected_field_map(expected, "fields", &item_struct.generics);
                let expected_cfg = normalize_cfg_map(
                    expected
                        .get("fieldCfg")
                        .cloned()
                        .unwrap_or_else(|| json!({})),
                );
                let actual = json!({
                    "kind": "struct",
                    "generics": actual_generics,
                    "fields": fields,
                    "fieldCfg": field_cfg,
                });
                let matches = expected_kind == "struct"
                    && is_public
                    && wanted_generics == actual_generics
                    && fields == expected_fields
                    && field_cfg == expected_cfg;
                ("struct".to_string(), actual, matches)
            }
        }
        Item::Enum(item_enum) => {
            let is_public = matches!(item_enum.vis, Visibility::Public(_));
            let actual_generics = normalize_generics(&item_enum.generics);
            let wanted_generics = expected_generics(expected);
            let (variants, variant_cfg) = variant_shape(item_enum);
            let expected_variants = normalize_expected_variants(expected, &item_enum.generics);
            let expected_cfg = normalize_cfg_map(
                expected
                    .get("variantCfg")
                    .cloned()
                    .unwrap_or_else(|| json!({})),
            );
            let actual = json!({
                "kind": "enum",
                "generics": actual_generics,
                "variants": variants,
                "variantCfg": variant_cfg,
            });
            let matches = expected.get("kind").and_then(Value::as_str) == Some("enum")
                && is_public
                && wanted_generics == actual_generics
                && variants == expected_variants
                && variant_cfg == expected_cfg;
            ("enum".to_string(), actual, matches)
        }
        Item::Type(item_type) => {
            let is_public = matches!(item_type.vis, Visibility::Public(_));
            let actual_generics = normalize_generics(&item_type.generics);
            let wanted_generics = expected_generics(expected);
            let target = normalize_type(&item_type.ty, &item_type.generics);
            let expected_target = expected
                .get("target")
                .and_then(|value| expected_type(value, &item_type.generics));
            let actual = json!({
                "kind": "typeAlias",
                "generics": actual_generics,
                "target": target,
            });
            let matches = expected.get("kind").and_then(Value::as_str) == Some("typeAlias")
                && is_public
                && wanted_generics == actual_generics
                && expected_target.as_deref() == Some(&target);
            ("typeAlias".to_string(), actual, matches)
        }
        _ => ("unexpected".to_string(), json!({}), false),
    }
}

fn item_name(item: &Item) -> Option<String> {
    match item {
        Item::Struct(item) => Some(item.ident.to_string()),
        Item::Enum(item) => Some(item.ident.to_string()),
        Item::Type(item) => Some(item.ident.to_string()),
        _ => None,
    }
}

fn item_attributes(item: &Item) -> &[Attribute] {
    match item {
        Item::Struct(item) => &item.attrs,
        Item::Enum(item) => &item.attrs,
        Item::Type(item) => &item.attrs,
        _ => &[],
    }
}

fn build_named_data(
    taffy_root: &Path,
    contract: &Value,
    file_cfg: &BTreeMap<String, Value>,
) -> Result<BTreeMap<String, NamedDataOutput>, String> {
    let groups = contract
        .get("namedDataGroups")
        .and_then(Value::as_array)
        .ok_or("contract namedDataGroups is not an array")?;
    let shapes = contract
        .get("namedDataShapes")
        .and_then(Value::as_object)
        .ok_or("contract namedDataShapes is not an object")?;
    let mut output = BTreeMap::new();
    for group in groups {
        let source = group
            .get("source")
            .and_then(Value::as_str)
            .ok_or("namedDataGroup source is missing")?;
        let file = parse_rust_file(&taffy_root.join(source))?;
        let indexed = file
            .items
            .iter()
            .filter_map(|item| item_name(item).map(|name| (name, item)))
            .collect::<HashMap<_, _>>();
        let expected_features = group
            .get("features")
            .and_then(Value::as_array)
            .map(|values| {
                values
                    .iter()
                    .filter_map(Value::as_str)
                    .map(str::to_string)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        for name in group
            .get("items")
            .and_then(Value::as_array)
            .ok_or("namedDataGroup items is missing")?
            .iter()
            .filter_map(Value::as_str)
        {
            let expected = shapes
                .get(name)
                .ok_or_else(|| format!("missing namedDataShapes.{name}"))?;
            if let Some(item) = indexed.get(name) {
                let effective_cfg = combine_cfg([
                    file_cfg.get(source).cloned().unwrap_or(Value::Bool(true)),
                    cfg_value(item_attributes(item)),
                ]);
                let effective_features = cfg_features(&effective_cfg);
                let expected_cfg = cfg_from_features(&expected_features);
                let (kind, actual_shape, shape_matches) = shape_for_item(item, expected);
                output.insert(
                    name.to_string(),
                    NamedDataOutput {
                        source: source.to_string(),
                        kind,
                        effective_features: effective_features.clone(),
                        effective_cfg: effective_cfg.clone(),
                        shape_matches: shape_matches && effective_cfg == expected_cfg,
                        actual_shape,
                    },
                );
            } else {
                output.insert(
                    name.to_string(),
                    NamedDataOutput {
                        source: source.to_string(),
                        kind: "missing".to_string(),
                        effective_features: file_cfg
                            .get(source)
                            .map(cfg_features)
                            .unwrap_or_default(),
                        effective_cfg: file_cfg.get(source).cloned().unwrap_or(Value::Bool(true)),
                        shape_matches: false,
                        actual_shape: json!({}),
                    },
                );
            }
        }
    }
    Ok(output)
}

fn derived_traits(item_struct: &ItemStruct) -> BTreeSet<String> {
    let mut output = BTreeSet::new();
    for attribute in &item_struct.attrs {
        if attribute.path().is_ident("derive")
            && let Ok(paths) = attribute.parse_args_with(
                syn::punctuated::Punctuated::<syn::Path, syn::Token![,]>::parse_terminated,
            )
        {
            for path in paths {
                if let Some(segment) = path.segments.last() {
                    output.insert(segment.ident.to_string());
                }
            }
        }
    }
    output
}

fn generic_argument(parameter: &GenericParam) -> String {
    match parameter {
        GenericParam::Type(parameter) => parameter.ident.to_string(),
        GenericParam::Lifetime(parameter) => token_string(&parameter.lifetime),
        GenericParam::Const(parameter) => parameter.ident.to_string(),
    }
}

fn declared_type(name: &str, generics: &Generics) -> Option<Type> {
    let arguments = generics
        .params
        .iter()
        .map(generic_argument)
        .collect::<Vec<_>>();
    let source = if arguments.is_empty() {
        name.to_string()
    } else {
        format!("{name}<{}>", arguments.join(", "))
    };
    syn::parse_str(&source).ok()
}

fn type_source_matches(actual: &Type, expected: &str, generics: &Generics) -> bool {
    syn::parse_str::<Type>(expected)
        .ok()
        .is_some_and(|expected| {
            normalize_type(actual, generics) == normalize_type(&expected, generics)
        })
}

fn impl_header_for(trait_name: &str, self_type: &str) -> Option<String> {
    syn::parse_str::<ItemImpl>(&format!("impl {trait_name} for {self_type} {{}}"))
        .ok()
        .map(|item| normalize_impl_header(&item))
}

fn public_tuple_fields(item: &ItemStruct) -> Option<Vec<Value>> {
    let Fields::Unnamed(fields) = &item.fields else {
        return None;
    };
    Some(
        fields
            .unnamed
            .iter()
            .enumerate()
            .filter(|(_, field)| matches!(field.vis, Visibility::Public(_)))
            .map(|(index, field)| {
                json!({
                    "index": index,
                    "type": normalize_type(&field.ty, &item.generics),
                })
            })
            .collect(),
    )
}

fn iterator_item(file: &syn::File, self_name: &str, file_cfg: &Value) -> Option<(String, Value)> {
    let implementations = find_impls(file, self_name, Some("Iterator"));
    if implementations.len() != 1 {
        return None;
    }
    let item_impl = implementations[0];
    let items = item_impl
        .items
        .iter()
        .filter_map(|item| match item {
            ImplItem::Type(item) if item.ident == "Item" => Some((
                normalize_type(&item.ty, &item_impl.generics),
                combine_cfg([
                    file_cfg.clone(),
                    cfg_value(&item_impl.attrs),
                    cfg_value(&item.attrs),
                ]),
            )),
            _ => None,
        })
        .collect::<Vec<_>>();
    (items.len() == 1).then(|| items[0].clone())
}

fn build_adjacent_roots(
    file: &syn::File,
    contract: &Value,
    file_cfg: &Value,
) -> Vec<AdjacentRootOutput> {
    let roots = contract
        .pointer("/upstream/adjacentRoots")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let tree_struct = file.items.iter().find_map(|item| match item {
        Item::Struct(item) if item.ident == "TaffyTree" => Some(item),
        _ => None,
    });
    let child_iter = file.items.iter().find_map(|item| match item {
        Item::Struct(item) if item.ident == "TaffyTreeChildIter" => Some(item),
        _ => None,
    });
    let derives = tree_struct.map(derived_traits).unwrap_or_default();
    let expected_derives = roots
        .iter()
        .filter(|root| root.get("kind").and_then(Value::as_str) == Some("derivedTraitImpl"))
        .filter_map(|root| root.get("trait").and_then(Value::as_str))
        .map(str::to_string)
        .collect::<BTreeSet<_>>();
    roots
        .into_iter()
        .map(|root| {
            let kind = root.get("kind").and_then(Value::as_str).unwrap_or("");
            let name = root
                .get("trait")
                .or_else(|| root.get("rustPath"))
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string();
            let expected_cfg = root
                .get("cfg")
                .cloned()
                .map(normalize_cfg)
                .unwrap_or(Value::Bool(true));
            let expected_for = root.get("for").and_then(Value::as_str).unwrap_or("");
            let matches = match kind {
                "traitImpl" => {
                    let implementations = find_impls(file, "TaffyTree", Some(&name));
                    implementations.len() == 1
                        && impl_header_for(&name, expected_for).is_some_and(|expected| {
                            normalize_impl_header(implementations[0]) == expected
                        })
                        && combine_cfg([file_cfg.clone(), cfg_value(&implementations[0].attrs)])
                            == expected_cfg
                }
                "derivedTraitImpl" => tree_struct.is_some_and(|item| {
                    let declared = declared_type("TaffyTree", &item.generics);
                    derives == expected_derives
                        && derives.contains(&name)
                        && matches!(item.vis, Visibility::Public(_))
                        && declared.is_some_and(|actual| {
                            type_source_matches(&actual, expected_for, &item.generics)
                        })
                        && combine_cfg([file_cfg.clone(), cfg_value(&item.attrs)]) == expected_cfg
                }),
                "struct" => child_iter.is_some_and(|item| {
                    let expected_path = root.get("rustPath").and_then(Value::as_str).unwrap_or("");
                    let expected_item = root
                        .get("iteratorItem")
                        .and_then(Value::as_str)
                        .and_then(|value| syn::parse_str::<Type>(value).ok())
                        .map(|value| normalize_type(&value, &Generics::default()));
                    let actual_declared = declared_type("TaffyTreeChildIter", &item.generics);
                    matches!(item.vis, Visibility::Public(_))
                        && actual_declared.is_some_and(|actual| {
                            let expected_short =
                                expected_path.rsplit("::").next().unwrap_or(expected_path);
                            type_source_matches(&actual, expected_short, &item.generics)
                        })
                        && public_tuple_fields(item).is_some_and(|fields| {
                            fields
                                == root
                                    .get("publicFields")
                                    .and_then(Value::as_array)
                                    .cloned()
                                    .unwrap_or_default()
                        })
                        && combine_cfg([file_cfg.clone(), cfg_value(&item.attrs)]) == expected_cfg
                        && iterator_item(file, "TaffyTreeChildIter", file_cfg)
                            == expected_item.map(|item| (item, expected_cfg.clone()))
                }),
                _ => false,
            };
            AdjacentRootOutput {
                kind: kind.to_string(),
                name,
                source: root
                    .get("source")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string(),
                matches,
                detail: root,
            }
        })
        .collect()
}

fn contract_test_inventory(path: &Path) -> Result<Vec<ContractTestOutput>, String> {
    let file = parse_rust_file(path)?;
    Ok(file
        .items
        .into_iter()
        .filter_map(|item| {
            let Item::Fn(function) = item else {
                return None;
            };
            let identity = function.sig.ident.to_string();
            if !identity.starts_with("contract__") {
                return None;
            }
            Some(ContractTestOutput {
                identity,
                is_test: function
                    .attrs
                    .iter()
                    .filter(|attribute| attribute.path().is_ident("test"))
                    .count()
                    == 1,
                forbidden_attribute: function.attrs.iter().any(|attribute| {
                    attribute.path().is_ident("cfg") || attribute.path().is_ident("ignore")
                }),
            })
        })
        .collect())
}

fn run() -> Result<(), String> {
    let mut arguments = env::args_os().skip(1);
    let first = arguments
        .next()
        .ok_or("missing parser command or Taffy source root")?;
    if first == "--contract-tests" {
        let path = PathBuf::from(
            arguments
                .next()
                .ok_or("missing contract-test source path")?,
        );
        if arguments.next().is_some() {
            return Err("unexpected extra argument".to_string());
        }
        println!(
            "{}",
            serde_json::to_string(&contract_test_inventory(&path)?)
                .map_err(|error| format!("failed to serialize contract-test inventory: {error}"))?
        );
        return Ok(());
    }
    let taffy_root = PathBuf::from(first);
    let contract_path = PathBuf::from(arguments.next().ok_or("missing contract.json argument")?);
    if arguments.next().is_some() {
        return Err("unexpected extra argument".to_string());
    }
    let contract = read_json(&contract_path)?;
    if contract.get("schemaVersion").and_then(Value::as_u64) != Some(10) {
        return Err("unsupported contract schema".to_string());
    }
    let canonical_root = taffy_root
        .canonicalize()
        .map_err(|error| format!("failed to resolve {}: {error}", taffy_root.display()))?;
    let mut file_cfg = BTreeMap::new();
    collect_file_cfg(
        &canonical_root,
        &canonical_root.join("src/lib.rs"),
        &Value::Bool(true),
        &mut file_cfg,
        &mut HashSet::new(),
    )?;
    let file_features = file_cfg
        .iter()
        .map(|(source, cfg)| (source.clone(), cfg_features(cfg)))
        .collect::<BTreeMap<_, _>>();

    let taffy_tree = contract
        .pointer("/upstream/taffyTree")
        .and_then(Value::as_object)
        .ok_or("contract upstream.taffyTree missing")?;
    let tree_source = taffy_tree
        .get("source")
        .and_then(Value::as_str)
        .ok_or("taffyTree source missing")?;
    let tree_file = parse_rust_file(&canonical_root.join(tree_source))?;
    let inherent_impls = find_impls(&tree_file, "TaffyTree", None);
    if inherent_impls.is_empty() {
        return Err("TaffyTree inherent impl missing".to_string());
    }
    let expected_inherent_header = taffy_tree
        .get("implHeader")
        .and_then(Value::as_str)
        .and_then(expected_impl_header);
    let inherent_impl_matches = expected_inherent_header.as_ref().is_some_and(|expected| {
        inherent_impls
            .iter()
            .all(|item_impl| expected == &normalize_impl_header(item_impl))
    });
    let tree_file_cfg = file_cfg
        .get(tree_source)
        .cloned()
        .unwrap_or(Value::Bool(true));
    let (inherent_methods, inherent_method_duplicates) = method_outputs(
        &inherent_impls,
        taffy_tree
            .get("methods")
            .and_then(Value::as_object)
            .ok_or("taffyTree methods missing")?,
        &tree_file_cfg,
    );

    let traverse = contract
        .pointer("/upstream/traversePartialTree")
        .and_then(Value::as_object)
        .ok_or("contract upstream.traversePartialTree missing")?;
    let wanted_trait = traverse
        .get("trait")
        .and_then(Value::as_str)
        .ok_or("traversePartialTree trait missing")?;
    let trait_impls = find_impls(&tree_file, "TaffyTree", Some(wanted_trait));
    if trait_impls.is_empty() {
        return Err("TaffyTree TraversePartialTree impl missing".to_string());
    }
    let expected_trait_header = traverse
        .get("implHeader")
        .and_then(Value::as_str)
        .and_then(expected_impl_header);
    let trait_impl_matches = trait_impls.len() == 1
        && expected_trait_header
            .as_ref()
            .is_some_and(|expected| expected == &normalize_impl_header(trait_impls[0]));
    let (trait_methods, trait_method_duplicates) = method_outputs(
        &trait_impls,
        traverse
            .get("methods")
            .and_then(Value::as_object)
            .ok_or("traversePartialTree methods missing")?,
        &tree_file_cfg,
    );
    let adjacent_roots = build_adjacent_roots(&tree_file, &contract, &tree_file_cfg);
    let named_data = build_named_data(&canonical_root, &contract, &file_cfg)?;
    let output = ParserOutput {
        parser: "syn-2.0.119",
        taffy_root: canonical_root.display().to_string(),
        file_features,
        file_cfg,
        inherent_impl_matches,
        inherent_method_duplicates,
        inherent_methods,
        trait_impl_matches,
        trait_method_duplicates,
        trait_methods,
        adjacent_roots,
        named_data,
    };
    println!(
        "{}",
        serde_json::to_string(&output)
            .map_err(|error| format!("failed to serialize parser output: {error}"))?
    );
    Ok(())
}

fn main() {
    if let Err(error) = run() {
        eprintln!("{error}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temporary_directory(name: &str) -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock is after epoch")
            .as_nanos();
        let path = env::temp_dir().join(format!("taffy-api-{name}-{}-{nonce}", std::process::id()));
        fs::create_dir(&path).expect("temporary directory is created");
        path
    }

    #[test]
    fn aggregates_public_methods_from_every_matching_impl() {
        let file = syn::parse_file(
            "impl<T> TaffyTree<T> { pub fn first(&self) {} }\nimpl<T> TaffyTree<T> { pub fn added(&self) {} }",
        )
        .expect("fixture parses");
        let implementations = find_impls(&file, "TaffyTree", None);
        let expected = serde_json::from_value::<Map<String, Value>>(json!({
            "first": { "signature": "fn first(&self)" }
        }))
        .expect("expected methods parse");
        let (methods, duplicates) = method_outputs(&implementations, &expected, &Value::Bool(true));
        assert_eq!(implementations.len(), 2);
        assert_eq!(
            methods.keys().cloned().collect::<Vec<_>>(),
            ["added", "first"]
        );
        assert!(duplicates.is_empty());
        assert!(!methods["added"].signature_matches);
    }

    #[test]
    fn preserves_cfg_boolean_structure() {
        let any: ItemStruct =
            syn::parse_str("#[cfg(any(feature = \"a\", feature = \"b\"))] pub struct Example;")
                .expect("fixture parses");
        let all: ItemStruct =
            syn::parse_str("#[cfg(all(feature = \"a\", feature = \"b\"))] pub struct Example;")
                .expect("fixture parses");
        let not: ItemStruct = syn::parse_str("#[cfg(not(feature = \"a\"))] pub struct Example;")
            .expect("fixture parses");
        assert_ne!(cfg_value(&any.attrs), cfg_value(&all.attrs));
        assert_ne!(cfg_value(&not.attrs), json!({ "feature": "a" }));
    }

    #[test]
    fn includes_file_level_cfg_in_effective_cfg() {
        let root = temporary_directory("file-cfg");
        let source = root.join("lib.rs");
        fs::write(
            &source,
            "#![cfg(feature = \"file_gate\")]\npub struct Example;\n",
        )
        .expect("fixture is written");
        let mut output = BTreeMap::new();
        collect_file_cfg(
            &root,
            &source,
            &json!({ "feature": "module_gate" }),
            &mut output,
            &mut HashSet::new(),
        )
        .expect("file cfg is collected");
        assert_eq!(
            output["lib.rs"],
            normalize_cfg(json!({
                "all": [
                    { "feature": "file_gate" },
                    { "feature": "module_gate" }
                ]
            }))
        );
        fs::remove_dir_all(root).expect("temporary directory is removed");
    }

    #[test]
    fn opaque_tuple_shape_rejects_named_and_unit_structs() {
        let expected = json!({ "kind": "opaqueTupleStruct", "publicFields": [] });
        let tuple =
            Item::Struct(syn::parse_str("pub struct NodeId(u64);").expect("fixture parses"));
        let named = Item::Struct(
            syn::parse_str("pub struct NodeId { value: u64 }").expect("fixture parses"),
        );
        let unit = Item::Struct(syn::parse_str("pub struct NodeId;").expect("fixture parses"));
        let private_tuple =
            Item::Struct(syn::parse_str("pub(crate) struct NodeId(u64);").expect("fixture parses"));
        assert!(shape_for_item(&tuple, &expected).2);
        assert!(!shape_for_item(&named, &expected).2);
        assert!(!shape_for_item(&unit, &expected).2);
        assert!(!shape_for_item(&private_tuple, &expected).2);
    }

    #[test]
    fn inventories_real_contract_tests_without_comments() {
        let root = temporary_directory("contract-tests");
        let source = root.join("contract_tests.rs");
        fs::write(
            &source,
            "// #[test]\n// fn contract__commented() {}\n#[test]\nfn contract__real() {}\n#[ignore]\n#[test]\nfn contract__ignored() {}\n",
        )
        .expect("fixture is written");
        let inventory = contract_test_inventory(&source).expect("inventory is parsed");
        assert_eq!(inventory.len(), 2);
        assert_eq!(inventory[0].identity, "contract__real");
        assert!(inventory[0].is_test);
        assert!(!inventory[0].forbidden_attribute);
        assert_eq!(inventory[1].identity, "contract__ignored");
        assert!(inventory[1].forbidden_attribute);
        fs::remove_dir_all(root).expect("temporary directory is removed");
    }
}
