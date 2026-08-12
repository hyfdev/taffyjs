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
    inherent_impl_matches: bool,
    inherent_methods: BTreeMap<String, MethodOutput>,
    trait_impl_matches: bool,
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
    shape_matches: bool,
    actual_shape: Value,
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
    match values.as_slice() {
        [] => Value::Bool(true),
        [only] => only.clone(),
        _ => json!({ "all": values }),
    }
}

fn cfg_features(attributes: &[Attribute]) -> Vec<String> {
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
    visit(&cfg_value(attributes), &mut features);
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

fn collect_file_features(
    root: &Path,
    current: &Path,
    inherited: &[String],
    output: &mut BTreeMap<String, Vec<String>>,
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
    output.insert(relative, inherited.to_vec());
    let file = parse_rust_file(&canonical)?;
    for item in file.items {
        if let Item::Mod(module) = item
            && module.content.is_none()
            && let Some(path) = resolve_module_file(&canonical, &module)
        {
            let mut features = inherited.to_vec();
            features.extend(cfg_features(&module.attrs));
            features.sort();
            features.dedup();
            collect_file_features(root, &path, &features, output, visited)?;
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
    item_impl: &ItemImpl,
    expected_methods: &Map<String, Value>,
) -> BTreeMap<String, MethodOutput> {
    item_impl
        .items
        .iter()
        .filter_map(|item| {
            let ImplItem::Fn(method) = item else {
                return None;
            };
            if item_impl.trait_.is_none() && !matches!(method.vis, Visibility::Public(_)) {
                return None;
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
            Some((
                name,
                MethodOutput {
                    normalized_signature: normalized,
                    expected_normalized_signature: expected_normalized,
                    signature_matches,
                    cfg: cfg_value(&method.attrs),
                },
            ))
        })
        .collect()
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

fn find_impl<'a>(
    file: &'a syn::File,
    self_name: &str,
    wanted_trait: Option<&str>,
) -> Option<&'a ItemImpl> {
    file.items.iter().find_map(|item| {
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
            let actual_generics = normalize_generics(&item_struct.generics);
            let wanted_generics = expected_generics(expected);
            let expected_kind = expected.get("kind").and_then(Value::as_str).unwrap_or("");
            if expected_kind == "opaqueTupleStruct" {
                let public_fields = match &item_struct.fields {
                    Fields::Unnamed(fields) => fields
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
                    _ => Vec::new(),
                };
                let actual = json!({
                    "kind": "opaqueTupleStruct",
                    "generics": actual_generics,
                    "publicFields": public_fields,
                });
                let expected_public_count = expected
                    .get("publicFields")
                    .and_then(Value::as_array)
                    .map_or(0, Vec::len);
                let matches = wanted_generics == actual_generics
                    && actual["publicFields"].as_array().map_or(0, Vec::len)
                        == expected_public_count;
                ("opaqueTupleStruct".to_string(), actual, matches)
            } else {
                let fields = named_fields_shape(&item_struct.fields, &item_struct.generics);
                let field_cfg = field_cfg_shape(&item_struct.fields);
                let expected_fields =
                    normalize_expected_field_map(expected, "fields", &item_struct.generics);
                let expected_cfg = expected
                    .get("fieldCfg")
                    .cloned()
                    .unwrap_or_else(|| json!({}));
                let actual = json!({
                    "kind": "struct",
                    "generics": actual_generics,
                    "fields": fields,
                    "fieldCfg": field_cfg,
                });
                let matches = expected_kind == "struct"
                    && wanted_generics == actual_generics
                    && fields == expected_fields
                    && field_cfg == expected_cfg;
                ("struct".to_string(), actual, matches)
            }
        }
        Item::Enum(item_enum) => {
            let actual_generics = normalize_generics(&item_enum.generics);
            let wanted_generics = expected_generics(expected);
            let (variants, variant_cfg) = variant_shape(item_enum);
            let expected_variants = normalize_expected_variants(expected, &item_enum.generics);
            let expected_cfg = expected
                .get("variantCfg")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let actual = json!({
                "kind": "enum",
                "generics": actual_generics,
                "variants": variants,
                "variantCfg": variant_cfg,
            });
            let matches = expected.get("kind").and_then(Value::as_str) == Some("enum")
                && wanted_generics == actual_generics
                && variants == expected_variants
                && variant_cfg == expected_cfg;
            ("enum".to_string(), actual, matches)
        }
        Item::Type(item_type) => {
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
    file_features: &BTreeMap<String, Vec<String>>,
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
                let mut effective_features = file_features.get(source).cloned().unwrap_or_default();
                effective_features.extend(cfg_features(item_attributes(item)));
                effective_features.sort();
                effective_features.dedup();
                let mut sorted_expected_features = expected_features.clone();
                sorted_expected_features.sort();
                sorted_expected_features.dedup();
                let (kind, actual_shape, shape_matches) = shape_for_item(item, expected);
                output.insert(
                    name.to_string(),
                    NamedDataOutput {
                        source: source.to_string(),
                        kind,
                        effective_features: effective_features.clone(),
                        shape_matches: shape_matches
                            && effective_features == sorted_expected_features,
                        actual_shape,
                    },
                );
            } else {
                output.insert(
                    name.to_string(),
                    NamedDataOutput {
                        source: source.to_string(),
                        kind: "missing".to_string(),
                        effective_features: file_features.get(source).cloned().unwrap_or_default(),
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

fn build_adjacent_roots(file: &syn::File, contract: &Value) -> Vec<AdjacentRootOutput> {
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
            let matches = match kind {
                "traitImpl" => find_impl(file, "TaffyTree", Some(&name)).is_some(),
                "derivedTraitImpl" => derives.contains(&name),
                "struct" => child_iter.is_some_and(|item| {
                    let public_fields = match &item.fields {
                        Fields::Unnamed(fields) => fields
                            .unnamed
                            .iter()
                            .filter(|field| matches!(field.vis, Visibility::Public(_)))
                            .count(),
                        Fields::Named(fields) => fields
                            .named
                            .iter()
                            .filter(|field| matches!(field.vis, Visibility::Public(_)))
                            .count(),
                        Fields::Unit => 0,
                    };
                    public_fields
                        == root
                            .get("publicFields")
                            .and_then(Value::as_array)
                            .map_or(0, Vec::len)
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

fn run() -> Result<(), String> {
    let mut arguments = env::args_os().skip(1);
    let taffy_root = PathBuf::from(
        arguments
            .next()
            .ok_or("missing Taffy source root argument")?,
    );
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
    let mut file_features = BTreeMap::new();
    collect_file_features(
        &canonical_root,
        &canonical_root.join("src/lib.rs"),
        &[],
        &mut file_features,
        &mut HashSet::new(),
    )?;

    let taffy_tree = contract
        .pointer("/upstream/taffyTree")
        .and_then(Value::as_object)
        .ok_or("contract upstream.taffyTree missing")?;
    let tree_source = taffy_tree
        .get("source")
        .and_then(Value::as_str)
        .ok_or("taffyTree source missing")?;
    let tree_file = parse_rust_file(&canonical_root.join(tree_source))?;
    let inherent_impl =
        find_impl(&tree_file, "TaffyTree", None).ok_or("TaffyTree inherent impl missing")?;
    let expected_inherent_header = taffy_tree
        .get("implHeader")
        .and_then(Value::as_str)
        .and_then(expected_impl_header);
    let inherent_impl_matches = expected_inherent_header
        .as_ref()
        .is_some_and(|expected| expected == &normalize_impl_header(inherent_impl));
    let inherent_methods = method_outputs(
        inherent_impl,
        taffy_tree
            .get("methods")
            .and_then(Value::as_object)
            .ok_or("taffyTree methods missing")?,
    );

    let traverse = contract
        .pointer("/upstream/traversePartialTree")
        .and_then(Value::as_object)
        .ok_or("contract upstream.traversePartialTree missing")?;
    let wanted_trait = traverse
        .get("trait")
        .and_then(Value::as_str)
        .ok_or("traversePartialTree trait missing")?;
    let trait_impl = find_impl(&tree_file, "TaffyTree", Some(wanted_trait))
        .ok_or("TaffyTree TraversePartialTree impl missing")?;
    let expected_trait_header = traverse
        .get("implHeader")
        .and_then(Value::as_str)
        .and_then(expected_impl_header);
    let trait_impl_matches = expected_trait_header
        .as_ref()
        .is_some_and(|expected| expected == &normalize_impl_header(trait_impl));
    let trait_methods = method_outputs(
        trait_impl,
        traverse
            .get("methods")
            .and_then(Value::as_object)
            .ok_or("traversePartialTree methods missing")?,
    );
    let adjacent_roots = build_adjacent_roots(&tree_file, &contract);
    let named_data = build_named_data(&canonical_root, &contract, &file_features)?;
    let output = ParserOutput {
        parser: "syn-2.0.119",
        taffy_root: canonical_root.display().to_string(),
        file_features,
        inherent_impl_matches,
        inherent_methods,
        trait_impl_matches,
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
