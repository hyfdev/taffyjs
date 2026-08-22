# Binding Mapping Cases

These cases are practical applications of API design. Each one starts with observable Rust behavior, applies the current mapping rules to a real JavaScript boundary, examines the choices that the rules do not settle automatically, and records corrections when the reasoning becomes ambiguous or overdesigned. Vouched product judgments remain in [@taffyjs/node decisions](taffyjs-node-decisions.md).

Their purpose is to test and improve the design method, then provide worked reasoning that a later AI can reuse while autonomously iterating other API alignments. A case should preserve the evidence, rejected alternatives, human judgments, reusable conclusions, and the condition that would require another discussion, rather than only its final API shape.

The feedback loop is: apply the current rules to concrete upstream behavior; distinguish mechanical derivation from a genuine product choice; ask for human judgment only when evidence and existing rules cannot determine the public contract; incorporate the correction into both the case and the shared mapping reference; then stop when further detail would only repeat an established rule. Completing a case means that its practical test has produced all of its useful API-design reference, not that the project has moved to another delivery phase.

Direct reads still materialize complete snapshots. The measured callback path now preserves the same complete Style capability through on-demand `getStyle()` delivery as recorded in the [read boundary](architecture.md#read-boundary); selective reads remain separate work under the [performance TODO](api-alignment-todos.md#performance).

The evidence baseline for this case is Taffy 0.13.0, napi 3.12.0, napi-derive 3.6.2, and @napi-rs/cli 3.8.2.

## Case 1: TaffyTree layout state and node identities

### Rust behavior

`TaffyTree` owns node styles, relationships, cached computations, and stored layouts. A `NodeId` is a copyable numeric slotmap key used to address that state; it is not an independently owned node object and carries no reference to its TaffyTree.

#### Layout reads return stored state

A new node starts with a zero Layout. Calling `getLayout(node)` before computation returns that stored zero value. Calling `set_style` replaces the Style and marks the node and its ancestors dirty, but it does not compute a new layout. Until the caller invokes `compute_layout`, `getLayout(node)` continues to return the previous stored result.

The dirty query reports whether that node's own Taffy cache is empty. It is not a complete freshness check. For example, changing a parent can leave a child reporting `dirty == false` even though recomputing the parent will change the child's stored position.

This is a direct API contract rather than an error to repair. An API that computes before reading or promises a current result would be additive sugar with different work and semantics.

#### Layout references cannot cross the boundary

Rust returns `&Layout`, borrowed from the TaffyTree. Rust will not allow the tree to be mutated while that reference remains in use. JavaScript cannot express this borrow, so the binding copies Layout into an owned JavaScript snapshot. Mutating the snapshot never mutates native tree state.

Readonly TypeScript fields describe the snapshot boundary to TypeScript consumers. Runtime snapshots remain ordinary mutable objects; freezing, sealing, and proxies are outside the current API.

#### NodeId equality does not include the tree

`NodeId` derives equality from its single stored `u64`. Two separately created TaffyTree instances can issue equal NodeId values. Passing one tree's NodeId to another tree can therefore access the other tree's node when the numeric keys match instead of producing an error. Using a NodeId after removal can index missing storage and panic.

The JavaScript binding must do more than Rust's `NodeId == NodeId`: it must know which tree issued a public NodeId and whether the node still exists before calling Taffy.

### JavaScript boundary

The outer model remains tree-centered:

```ts
const tree = new TaffyTree();
const child = tree.newLeaf(childStyle);
const root = tree.newWithChildren([child], rootStyle);

tree.computeLayout({ root, availableSpace });
const layout = tree.getLayout(child);
```

The public `TaffyTree` wrapper stores one private native tree in `#inner`, which remains the sole layout-state owner. `child` and `root` are bigint values that JavaScript can retain and pass back to tree methods; they do not own a second Style, Layout, or child list.

The public type is a bigint with a private phantom type marker and a private numeric encoding:

```ts
declare const phantomMarker: unique symbol;

export type NodeId = bigint & {
  readonly [phantomMarker]: never;
};
```

The private `unique symbol` is a phantom marker: it keeps an ordinary bigint from satisfying `NodeId` accidentally during type checking but has no runtime representation. It does not stop JavaScript from constructing or modifying a bigint, so runtime checks remain mandatory.

The bigint logically contains a tree identity, a binding-issued serial for that node creation, and the raw Taffy NodeId. The exact field widths and encoding are not public. Each public tree wrapper keeps a private registry such as:

```ts
#inner: BindingTaffyTree;
#nodes: PrivateNodeRegistry;
```

This registry contains one entry for each node currently stored in the TaffyTree. It is binding identity metadata, not a copy of Style, Layout, parent, children, or cache state.

Before native access, the wrapper confirms that each NodeId is a bigint with the complete private format, was issued by the target tree, and still matches the current registry entry for its raw Taffy NodeId. An ordinary object, a malformed bigint, a NodeId from another tree, and a NodeId for a removed node produce controlled JavaScript errors through @taffyjs/node.

The JavaScript registry is the sole NodeId-validity registry for the supported API, so its single current-node lookup happens immediately before the synchronous native call in the ordinary value-object path. The baseline does not add a second lookup or a dedicated defensive copy solely for a getter or Proxy trap that mutates the same tree during argument conversion; that re-entrant value-object behavior is outside the initial guarantee. This is an internal implementation constraint rather than additional public NodeId behavior. Direct calls to the separate private platform packages bypass the wrapper and are deliberately outside the public API and its safety guarantee.

A successful creation adds the corresponding registry entry, a successful removal deletes it, and clearing the tree clears the registry. A supported operation must not report success while exposing disagreement between the native tree and that registry. If a later node receives the same raw Taffy NodeId, it receives a new binding-issued serial and therefore a different public NodeId. The old bigint remains an ordinary JavaScript value but no longer passes the registry check.

The registry does not need weak keys or automatic cleanup when application code drops a NodeId. TaffyTree itself continues to own that node until explicit removal, clearing, or collection of the whole tree. The registry therefore grows with the nodes still stored in the tree, not with the number of nodes ever created. A bigint NodeId does not retain a reference to its tree, so collecting the tree also collects its registry.

### Equality in JavaScript

Every query that returns the same current node recreates the same bigint value. JavaScript can therefore use `===`, `Map`, `Set`, and `includes` directly. Equality states that two values name the same binding-issued node identity; it does not prove that the node is still present. Liveness is checked when a tree operation consumes the NodeId, so no separate `isSameNode` API is needed for ordinary identity comparisons.

### Conclusion

This case is closed as an API mapping exercise. It fixes the outer state owner, stored-layout behavior, owned snapshot boundary, public NodeId value model, JavaScript equality behavior, cross-tree and stale-node rejection, registry lifetime, internal-ID reuse behavior, and the no-data-cache boundary. Those conclusions are implemented; the private NodeId bit layout remains an internal detail. The current vouched product wording is kept in [@taffyjs/node decisions](taffyjs-node-decisions.md), and the reusable implementation rules are in [Taffy-to-Node binding mapping](binding-mapping.md#nodeid).

### Evidence

- [TaffyTree and NodeData implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [NodeId implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/node.rs)
- [Layout implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/layout.rs)
- [ECMAScript Map objects](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects)
- [ECMAScript SameValueZero comparison](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero)

## Case 2: Style values and conversion boundaries

This case maps the complete Style value that JavaScript supplies to node creation and replacement and the owned readonly Style value returned by direct reads or a measure callback's `getStyle()`. It is intended to establish reusable value-mapping rules, not merely settle the spelling of one Style field.

This case is complete as an API-alignment example. Its reference value is that the selected container and value-family rules are sufficient to classify every currently known Style field without reviewing all 41 fields individually. The exhaustive inventory is intentionally outside the example because repeating already covered categories would add no new alignment reasoning.

### Rust behavior

`Style<DefaultCheapStr>` is one complete owned value. `new_leaf` moves a Style into the new node. `set_style` replaces the node's entire Style and then marks the node dirty; it does not merge the supplied value with the previous Style. `style` returns a borrowed reference to the complete stored Style, and `compute_layout_with_measure` passes a borrowed reference to that same complete value during measurement.

Taffy's examples normally construct a small set of fields and use `..Default::default()` for the rest. Under the repository's pinned default feature set, Style has 41 semantic fields after excluding its Rust-only phantom field. Their transitive types cover booleans, numeric values, optional values, closed keywords, alignment records, generic `Point`, `Size`, `Rect`, and `Line` records, semantic length variants, nested grid collections, custom grid identifiers, and integer counts and indices.

The `calc` feature is enabled by Taffy's default features, which this repository keeps enabled, but its public length types represent calc values through opaque pointers. The high-level `TaffyTree` implementation resolves every calc pointer to `0.0`; it does not expose an application resolver. Raw calc pointers therefore cannot define a JavaScript Style value, so the selected public high-level Style vocabulary excludes calc.

### Selected JavaScript container semantics

The direct analogue of default-based Rust Style construction is a plain `StyleInput` object whose fields are optional. A missing field or a field whose value is `undefined` takes the corresponding `Style::DEFAULT` value. Node creation stores the resulting complete Style. `setStyle(node, input)` constructs another complete Style from defaults and the supplied fields and replaces the old Style; it does not merge omitted fields with the node's current Style. The additive `updateStyle(node, update)` operation instead preserves omitted values.

Fixed-shape geometry records used directly as Style fields are partial on input for the same default-based construction. Each missing or explicit-`undefined` `Point`, `Size`, `Rect`, or `Line` component comes from that component of the enclosing field's `Style::DEFAULT` value. Thus `size: { width: value }` gets the default `auto` height, `padding: { left: value }` gets zero for the other three sides, and `inset: { left: value }` gets `auto` for the other three sides. This never reads the stored Style. Unknown enumerable string components are rejected because every component is optional and a misspelling would otherwise silently select the default. This rule does not make tagged semantic values, grid payloads, or arbitrary nested records recursively partial.

The public boundary treats Style as an ordinary data object. The generated encoder reads every known property once, ignores unknown top-level properties without enumeration, and keeps its byte storage owned through the synchronous native call. Methods consuming NodeIds resolve them before encoding so getter or Proxy re-entry cannot change stale or foreign ID precedence; nested Style operations receive separate temporary storage.

The first checkpoint selects the following container rules:

| Question                 | Selected rule                                                                                                                                                                                                                                        | Reason                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field names and presence | Use JavaScript `camelCase`; make every `StyleInput` field optional.                                                                                                                                                                                  | This follows the existing JavaScript method vocabulary while expressing Rust's common `Style { selected_fields, ..Default::default() }` construction directly.                                                                                                                                                                                                                                    |
| Missing and `undefined`  | Start from `Style::DEFAULT`; a missing field or explicit `undefined` leaves that field at its Taffy default.                                                                                                                                         | The two forms have the same ordinary JavaScript optional-property meaning and napi-rs already distinguishes both from a present concrete value.                                                                                                                                                                                                                                                   |
| `null`                   | Reject `null` when a field's public value cannot be empty. Accept it for a publicly nullable field, currently backed by Taffy `Option<T>`, where it explicitly means `None`; omission and `undefined` still mean “use this Taffy version's default.” | This preserves explicit absence for `aspectRatio`, alignment fields, and `gridTemplateAreas`. If a nullable field defaults to `Some(value)`, omission and `undefined` select that value while `null` still selects `None`.                                                                                                                                                                        |
| Unknown fields           | Ignore unknown top-level Style properties without enumerating them; continue to reject unknown components of partial geometry records.                                                                                                               | The generated encoder reads each known property once and never enumerates the Style object, so an unknown top-level property has nothing to read; the accepted cost is that a misspelled top-level field silently selects that field's default. Partial geometry records stay strict because a misspelled component would silently default or preserve one part of a field the caller did supply. |
| `setStyle`               | Replace the complete stored Style with the default-plus-supplied value.                                                                                                                                                                              | This preserves `TaffyTree::set_style`; merging with the previous Style would require a native read and define a different operation.                                                                                                                                                                                                                                                              |
| Conversion and mutation  | Resolve consumed NodeIds, encode known Style properties once, then call native synchronously; compact decoding and complete candidate validation finish before replacing tree state.                                                                 | The operation preserves public error precedence and reaches mutation only with a complete Rust value, without a second property walk or rich-object conversion.                                                                                                                                                                                                                                   |

Under these rules, input and complete output have deliberately different outer shapes:

```ts
export interface StyleInput {
  /** Omitted or `undefined` uses Taffy's default display value. */
  display?: Display | undefined;
  /** Omitted or `undefined` uses Taffy's default; `null` explicitly selects no preferred aspect ratio. */
  aspectRatio?: number | null | undefined;
  /** Omitted or `undefined` uses Taffy's default; `null` explicitly leaves item alignment unspecified. */
  alignItems?: AlignItems | null | undefined;
  /** Missing or `undefined` components use the corresponding components of Taffy's default size. */
  size?: PartialSizeInput<DimensionInput> | DimensionInput | undefined;
  // Every other active Style field is optional.
}

export interface Style {
  readonly display: Display;
  readonly aspectRatio: number | null;
  readonly alignItems: AlignItems | null;
  readonly size: Size<Dimension>;
  // Every other active Style field is present.
}
```

The reusable geometry declarations referenced here are selected below.

The explicit `| undefined` members keep the declarations truthful for consumers that enable TypeScript's `exactOptionalPropertyTypes`: the runtime accepts both a missing property and an explicitly undefined property. Those forms use the field's default for construction and replacement and preserve the field for update, while `null` explicitly requests `None` for a publicly nullable field. Conversion stores only the resulting Rust value: when a default is `Some(value)`, omission or `undefined` and `null` remain observably different during replacement; when the default is already `None`, they converge. Every property where `null` and `undefined` differ must explain the operation-specific omission and explicit-null meanings in property-level JSDoc rather than relying only on an interface-level note. A complete `Style` keeps every field present and readonly, emits the concrete value for `Some(value)`, emits `null` for `None`, and never uses a missing or `undefined` field for nullable output.

`StyleInput` properties remain mutable in TypeScript. Conversion uses ordinary property access and does not inspect, reject, copy, freeze, or repeat validation solely because an input may contain accessors or be a Proxy; the caller owns those behaviors and side effects. Every binding-produced `Style` record uses readonly TypeScript properties because it is a detached snapshot whose mutation cannot change native state. Direct `getStyle(node)` reads and each callback `getStyle()` call return a complete materialized ordinary plain object without runtime freezing, sealing, or a Proxy. The callback does not create that object unless the function is called; this changes delivery cost without changing the Style value mapping.

The container rules are demonstrated by ordinary integration cases: `{}` and explicit `undefined` produce Taffy defaults; `setStyle(node, {})` resets a previously nondefault Style instead of merging; a partial fixed-shape nested record fills each omitted component from the corresponding enclosing Style default rather than stored state; an unknown top-level field is ignored while an unknown partial-record component and `null` for a required field throw without changing the stored Style; `null` succeeds only for a publicly nullable field; a complete output uses `null` rather than an omitted or undefined field for Rust `None`; and declarations accept explicit `undefined` under `exactOptionalPropertyTypes` and retain the required property-level JSDoc. Focused tests cover getter, Proxy, and recursive operations across all five Style-taking methods.

### Additive partial updates

`StyleUpdate` reuses the structural field types of `StyleInput`, including readonly collection inputs, without applying a recursive `Partial`. `updateStyle` interprets a missing or explicit-`undefined` outer field as “preserve,” and interprets missing components of the four public partial geometry families the same way. A supplied shorthand geometry value still supplies every component. Arrays, tagged-union branches, and other complete input records remain complete whole replacements; `[]` clears a collection and accepted `null` maps to `None`.

TypeScript encodes the supplied fields and nested component masks once. Rust clones the stored Style, applies and compares those values directly through generated `decode_into`, including bitwise comparison for direct floating-point fields so repeated `NaN` and distinct signed zero behave predictably. Empty and unchanged inputs do not call Taffy's dirtying setter. For a real change, the complete candidate is validated before one `set_style` call, so a failure preserves both the old Style and dirty state.

Taffy 0.13 exposes the stored value through `style(&self) -> &Style` and replaces it through `set_style(Style)`, with no public mutable or take operation. The compact path therefore clones the current Style once for every update, then decodes, compares, and applies supplied fields in one traversal. An unchanged candidate is discarded without dirtying, while a changed candidate is validated and written once. Replacing a collection can clone the old collection before overwriting it. This preserves Taffy's sole ownership and avoids both a JavaScript shadow Style and a retained Rust patch; a future upstream closure-style update operation could safely expose in-place mutation and automatic dirty propagation.

The earlier rich-object implementation was justified by a focused end-to-end native-binding microbenchmark on implementation commit `6ed48b4` that retained the JavaScript-to-Rust boundary, input conversion, mutation, and alternating real value changes. It ran on Node.js 24.19.0 on Linux with an Intel Core i5-13500H, pinned to one core, after warmup, with 13 samples in each of two runs. Representative historical per-operation timings were:

| Preserved state and changed value                            | `setStyle` reconstruction | `updateStyle` |         Observed relation |
| ------------------------------------------------------------ | ------------------------: | ------------: | ------------------------: |
| One retained scalar; replace one scalar                      |                   3.83 µs |       3.89 µs |         Effectively equal |
| 13 retained sparse fields; replace one scalar                |                   11.8 µs |       3.89 µs | `updateStyle` 3.0× faster |
| Complete 41-field `getStyle` snapshot; replace one scalar    |                   23.1 µs |       3.97 µs | `updateStyle` 5.8× faster |
| 1,000 retained `gridAutoRows`; replace one scalar            |                    428 µs |       4.60 µs |  `updateStyle` 93× faster |
| Replace 1,000 `gridAutoRows`                                 |                    446 µs |        448 µs |         Effectively equal |
| 1,000 retained nested string grid values; replace one scalar |                    139 µs |       64.3 µs | `updateStyle` 2.2× faster |
| Replace 1,000 nested string grid values                      |                    139 µs |        196 µs |    `setStyle` 1.4× faster |

These historical measurements support recommending `updateStyle` for incremental changes: it avoids reconverting retained JavaScript fields, and the advantage grows when retained input is larger. They do not describe the current Style codec or establish per-call dominance. When the changed field itself is a large collection, both operations must encode and decode its replacement and can converge; the full-Style clone can still make update slower for some replacements. Current codec evidence is recorded separately in [Compact Style codec](style-codec.md).

The pointer-backed calc variant is a stop rather than a routine field mapping. The public high-level Style vocabulary excludes calc because `TaffyTree` resolves every calc pointer to zero and exposes no resolver. Whether the Cargo feature is also disabled is an implementation choice to verify separately; keeping an internal feature enabled does not make calc a supported JavaScript value.

### Selected closed-enum representation

Fieldless closed Style values use explicit binding-owned integer codes. Each family exposes an immutable namespace-like object of primitive numeric literals and a TypeScript union derived from those members. The runtime object and TypeScript type share one singular PascalCase family name, and every member uses PascalCase, producing names such as `Display.None`, `Overflow.Hidden`, and `FlexDirection.RowReverse`. The same convention applies to analogous enum-like public families elsewhere in @taffyjs/node. Documentation, JSDoc, declaration examples, and repository code use these named constants as the recommended form. Ordinary checked user code may write the corresponding raw numeric literal, but this is explicitly supported as a low-level escape hatch and is not recommended usage.

The public `EnumValue` helper derives each literal union, while API code generation emits the repeated family objects from the shared numeric-family input:

```ts
export type EnumValue<Family extends Readonly<Record<string, number>>> = Family[keyof Family];

export const Display = Object.freeze({
  Block: 0,
  FlowRoot: 1,
  Flex: 2,
  Grid: 3,
  None: 4,
} as const);
export type Display = EnumValue<typeof Display>;
```

The generated TypeScript constants and Rust validation codes come from `api/numeric-families.json`. CI regenerates both and rejects a Git diff, preventing the two language outputs from drifting.

Runtime conversion sees only a JavaScript number. It must check the original value as a finite integer and match one exact stable member code; it must not rely on coercive `i32` conversion that could turn `NaN`, infinity, a fraction, or an out-of-range value into another integer. Codes belong to the binding and never inherit Taffy's discriminants or declaration order.

`Display` is the literal union `0 | 1 | 2 | 3 | 4`. A contextually typed `display: 4` or a `const` literal therefore works directly, while `display: 99` and a widened general `number` fail ordinary declaration checks. The accepted raw form is intentionally not the recommended authoring style: callers should write `Display.None`, and public examples must not use `4` except when explaining or testing this boundary. The types are structural, so a member of another family also fits when it has the same literal code. Runtime provenance is not part of the contract, so any valid raw code behaves exactly like the recommended exported member, while an invalid code produces a controlled argument error before mutation. Complete output returns the same numeric member value, so comparison with the exported constant works and logs and JSON remain numeric.

Behavior tests cover representative exported members, raw literals, invalid values, round-trips, and tagged-record narrowing. Complete names and numeric codes belong to the maintained generator input and generated outputs; CI regeneration and its Git diff check prevent those outputs from drifting without copying the entire table into tests.

### Selected scalar floating-point representation

A concrete floating-point Style value accepts only a JavaScript `number`. The binding does not coerce strings, booleans, bigints, or other JavaScript values into numbers. napi-rs reads the JavaScript number as `f64`; the bridge then converts it explicitly to the `f32` value that Taffy actually stores, using ordinary floating-point rounding. The input need not be exactly representable as `f32`, so normal values such as `0.1` remain valid rather than requiring a special constructor or exactness check.

A complete Style output exposes the actual stored `f32` widened to a JavaScript `number`. It does not retain the original JavaScript `f64` solely to reproduce its input spelling or precision. A value supplied as `0.1` may therefore read back as `0.10000000149011612`, matching the value used by Taffy during layout.

Every JavaScript `number` is accepted at this scalar boundary. Negative values, `NaN`, positive and negative infinity, and finite `f64` values that become an infinite `f32` are converted and placed in the complete Rust Style without field-domain validation, clamping, normalization, or substitution with a default. For `aspectRatio`, `null` maps to Taffy `None`, while the concrete number `NaN` maps to `Some(NaN)`. Property-level JSDoc states the field's normal semantic domain but does not claim that the binding enforces it.

This is a responsibility boundary rather than a claim that every value produces useful layout. Once the complete Rust Style exists, the binding calls Taffy's `set_style` once and exposes the pinned Taffy version's stored value and later layout behavior. A structural, type, unsupported-variant, or closed-enum conversion error occurs before that call and leaves the old Style unchanged. Evidence that a concrete value reaches a Taffy panic or native-safety violation requires a safe exception, but surprising finite or non-finite layout alone does not.

Yoga provides a comparable separation without defining taffyjs details: its JavaScript wrapper forwards numeric values to native setters, while Yoga itself treats `NaN` as undefined and normalizes zero or infinite aspect ratios inside the engine. @taffyjs/node does not copy those normalizations; it follows Taffy's own Style and layout behavior.

The scalar acceptance cases therefore include ordinary rounding and truthful readback for `0.1`; pass-through and truthful stored-Style readback for negative and non-finite values; conversion overflow to an infinite `f32`; distinct `null` and `NaN` behavior for a nullable scalar; rejection of non-number JavaScript values without mutation; and no taffyjs-specific clamp or default substitution. Closed-enum codes, integers, indices, counts, and collection lengths retain their separate exact-integer rules.

### Selected semantic-length input and output representation

The complete semantic-length form uses a numeric literal discriminator and an ordinary record. Input additionally accepts a direct number as shorthand for the common absolute-length case. The shorthand is equivalent to the complete `Length` record and does not replace `Dimension.Length(value)`. Percent and Auto remain explicit, output always uses the complete tagged form, and CSS strings and Taffy's private compact tags remain outside the public API. `LengthUnit` is a binding-owned numeric family with `Length`, `Percent`, and `Auto` members, using the same stable-code, `EnumValue`, and naming rules as the other closed numeric families.

The conceptual declarations are:

```ts
export const LengthUnit = Object.freeze({
  Length: 0,
  Percent: 1,
  Auto: 2,
} as const);
export type LengthUnit = EnumValue<typeof LengthUnit>;

export interface LengthInput {
  unit: typeof LengthUnit.Length;
  value: number;
}

export interface PercentInput {
  unit: typeof LengthUnit.Percent;
  /** `50` means 50 percent and maps to Taffy's fractional value `0.5`. */
  value: number;
}

export interface AutoInput {
  unit: typeof LengthUnit.Auto;
}

export type LengthPercentageInput = number | LengthInput | PercentInput;
export type LengthPercentageAutoInput = LengthPercentageInput | AutoInput;
export type DimensionInput = LengthPercentageAutoInput;

export type LengthPercentage =
  | {
      readonly unit: typeof LengthUnit.Length;
      readonly value: number;
    }
  | {
      readonly unit: typeof LengthUnit.Percent;
      readonly value: number;
    };

export type LengthPercentageAuto =
  | LengthPercentage
  | {
      readonly unit: typeof LengthUnit.Auto;
    };

export type Dimension = LengthPercentageAuto;
```

The value-side `Dimension` namespace continues to provide `Dimension.Length(value)`, `Dimension.Percent(value)`, and `Dimension.Auto`. The helpers return the same ordinary records that callers may write directly; they are not native owners or classes. A direct numeric input is only an additive shorthand for `Dimension.Length(value)`. The namespace and members retain the vouched singular PascalCase family style.

Both a direct number and `Dimension.Length(value)` apply the selected ordinary `f64`-to-`f32` conversion and produce the same Taffy absolute length. `Dimension.Percent(50)` converts the user-facing percentage magnitude to Taffy's fractional representation before the final `f32` storage conversion. The reverse mapping reports a percentage magnitude through output. The binding does not require a normal range and does not reject negative, `NaN`, or infinite length and percent payloads. Output reports the stored unit and semantic value using readonly versions of the tagged records and does not retain the caller's input form, object, numeric precision, or spelling. Its discriminator remains the same numeric-literal `LengthUnit`, so a caller can use `switch (value.unit)` with ordinary TypeScript narrowing and can pass the output value back into a later Style input. Object identity is not meaningful. Invalid unit codes, missing required length or percent payloads, strings, and other unsupported JavaScript types fail conversion before Style replacement. An extra input property named `value` does not change an Auto variant and is not reproduced in output; the declaration does not add `value?: never` solely to catch that structural extra field.

For example, output use remains direct:

```ts
const width = tree.getStyle(node).size.width;

switch (width.unit) {
  case LengthUnit.Length:
  case LengthUnit.Percent:
    console.log(width.value);
    break;
  case LengthUnit.Auto:
    break;
}

tree.setStyle(otherNode, { size: { width } });
```

Keeping a numeric unit on output makes every returned meaning explicit; it does not require the shorter numeric input to preserve that shape. Logs and JSON therefore show the numeric code already accepted for the closed-enum design. If self-describing serialization later becomes a requirement, it should trigger a reconsideration of the output vocabulary instead of changing the input shorthand.

The input shorthand is unambiguous because the API defines a direct number as an absolute length, while Percent and Auto use objects. Complete tagged records are still necessary for output and for explicitly carrying the unit with its payload. The binding does not use packed numbers, bigint encodings, or raw `CompactLength` bits as public values.

Homogeneous `Rect` and `Size` semantic-length fields accept one contained value and copy it to every component. For example, `padding: 10` and `padding: Dimension.Length(10)` both set all four sides to an absolute length of ten, `margin: Dimension.Percent(5)` sets all four sides to five percent, and `gap: 10` sets both axes. The already selected partial record form remains available for component-specific values. Output always expands to a complete readonly `Rect` or `Size` and never preserves which input form was used.

This homogeneous form is not a claim of full CSS shorthand support. The initial binding does not parse CSS text, accept one-to-four-value strings or arrays, or infer analogous scalar meanings for `Line`, grid placement, and other records. A later CSS-facing layer may add those grammars without changing the canonical Taffy value mapping.

Acceptance cases cover numeric shorthand and `Dimension.Length(value)` equivalence, every valid unit and its required payload, `Dimension` helper and direct-object equivalence, 50-to-0.5 percent conversion, actual stored-value output, output-union narrowing by the shared unit tag, direct output-to-input round-trip, negative and non-finite payload pass-through, invalid unit and payload rejection before mutation, unsupported-type rejection, homogeneous `Rect` and `Size` expansion, partial component defaults, and complete readonly aggregate output.

### Selected alignment representation

Alignment uses two numeric literal families that flatten Taffy's public named constants. It does not expose CSS strings or Taffy's internal `{ keyword, safety }` struct shape.

| Family         | Members                                                                                                                                                                                               | Style fields                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `AlignItems`   | `Start`, `End`, `FlexStart`, `FlexEnd`, `SelfStart`, `SelfEnd`, `Center`, `Baseline`, `Stretch`, `SafeStart`, `SafeEnd`, `SafeFlexStart`, `SafeFlexEnd`, `SafeSelfStart`, `SafeSelfEnd`, `SafeCenter` | `alignItems`, `alignSelf`, `justifyItems`, `justifySelf` |
| `AlignContent` | `Start`, `End`, `FlexStart`, `FlexEnd`, `Center`, `Stretch`, `SpaceBetween`, `SpaceEvenly`, `SpaceAround`, `SafeStart`, `SafeEnd`, `SafeFlexStart`, `SafeFlexEnd`, `SafeCenter`                       | `alignContent`, `justifyContent`                         |

Each runtime family and TypeScript type follows the selected closed-enum rules. For example, `AlignItems.SafeCenter` is the recommended numeric constant accepted by the item-alignment fields, and a non-null Style output uses that same primitive code. Taffy's Rust aliases share the corresponding runtime family rather than creating distinct code sets. The declaration may provide semantic type aliases if they improve field documentation, but it does not need duplicate runtime constant objects.

`Safe` is CSS's overflow-position modifier. Taffy preserves it as part of the Style value and falls back to logical `Start` when the requested placement would overflow. Consequently `SafeCenter` and `SafeEnd` can lay out differently from their ordinary forms, while `SafeStart` currently lays out like `Start` because both the requested placement and fallback are `Start`. The binding still preserves `SafeStart` on output so Style round-trip does not erase a public Taffy value.

Only named public combinations receive codes. The binding does not manufacture the full product of Taffy's position-keyword and safety fields: there is no `SafeBaseline`, `SafeStretch`, or `SafeSpaceBetween`. CSS does not define those combinations, and Taffy's parser rejects them. Ordinary members such as `Start` already carry Taffy's default `Unsafe` state, so parallel `Unsafe*` names would only duplicate values. This membership boundary selects the public semantic vocabulary rather than adding JavaScript-side layout normalization.

Representative behavior cases cover named-constant and raw-literal input, same-code output, nullable field round-trip, TypeScript rejection of invalid values, and runtime rejection before Style replacement. Complete family membership belongs to the maintained generator input and generated outputs rather than a test that repeats every member or every alignment combination.

### Selected geometry record representation

The four public geometry families retain Taffy's named components and distinguish complete caller input, partial Style input, and complete binding output. Conceptually:

```ts
export interface PointInput<T> {
  x: T;
  y: T;
}

export interface PartialPointInput<T> {
  x?: T | undefined;
  y?: T | undefined;
}

export interface Point<T> {
  readonly x: T;
  readonly y: T;
}

export interface SizeInput<T> {
  width: T;
  height: T;
}

export interface PartialSizeInput<T> {
  width?: T | undefined;
  height?: T | undefined;
}

export interface Size<T> {
  readonly width: T;
  readonly height: T;
}

export interface RectInput<T> {
  left: T;
  right: T;
  top: T;
  bottom: T;
}

export interface PartialRectInput<T> {
  left?: T | undefined;
  right?: T | undefined;
  top?: T | undefined;
  bottom?: T | undefined;
}

export interface Rect<T> {
  readonly left: T;
  readonly right: T;
  readonly top: T;
  readonly bottom: T;
}

export interface LineInput<T> {
  start: T;
  end: T;
}

export interface PartialLineInput<T> {
  start?: T | undefined;
  end?: T | undefined;
}

export interface Line<T> {
  readonly start: T;
  readonly end: T;
}
```

The complete `*Input<T>` interfaces are mutable declarations for caller-supplied records. A Style field uses the matching `Partial*Input<T>` because its missing or explicit-`undefined` components can come from that field's enclosing `Style::DEFAULT`; an unrelated input boundary does not gain that behavior. `availableSpace`, for example, uses a complete `SizeInput<AvailableSpaceInput>`, and a measure function returns a complete `SizeInput<number>`. Values supplied by the binding use the unsuffixed complete readonly form: callback `knownDimensions` is a `Size<number | undefined>`, callback `availableSpace` is a `Size<AvailableSpace>`, and a Style snapshot composes readonly geometry with the selected readonly payload types.

The outer record owns no payload semantics. Every concrete component is converted through the selected mapping for its `T`, and native code must instantiate a converter for each required concrete geometry type even when TypeScript reuses these generic declarations. An outer converter does not coerce, clamp, or normalize a successfully converted payload.

The ordinary input form is one object with the named properties. Arrays, tuples, positional constructors, and native geometry owners are not parallel canonical forms. `RectInput` does not add logical-edge or Yoga-style aggregate keys; it remains `left`, `right`, `top`, and `bottom`. The already vouched one-value input is a narrow Style convenience for homogeneous semantic-length `PartialSizeInput` and `PartialRectInput` fields. It does not make `PartialPointInput<Overflow>` or `PartialLineInput<GridPlacementInput>` scalar, and any later grid convenience must state its grid-specific meaning instead of inheriting a generic fill-all rule.

Acceptance cases cover each exact component set, complete mutable `*Input` records, missing and explicit-`undefined` `Partial*Input` Style-component defaults, required components outside Style, complete readonly unsuffixed output with the correct readonly payload, output-to-input structural reuse, unknown component and array rejection, the existing semantic-length `PartialSizeInput` and `PartialRectInput` expansion, and absence of scalar `PartialPointInput` or `PartialLineInput` expansion and extra `RectInput` aliases.

### Selected AvailableSpace representation

Taffy's `AvailableSpace` has one data-carrying variant, `Definite(f32)`, and two fieldless variants, `MinContent` and `MaxContent`. Input accepts a direct number as additive shorthand for `Definite`; the complete `AvailableSpace.Definite(value)` form remains supported. `MinContent` and `MaxContent` remain explicit objects. JavaScript distinguishes the number shorthand from those objects without reserving a numeric payload or creating a collision, so every number, including negative values, `NaN`, and infinities, remains available to `Definite`.

Complete values use ordinary tagged records. Their `kind` discriminator is the numeric-literal `AvailableSpaceKind` family with PascalCase `Definite`, `MinContent`, and `MaxContent` members. Conceptually:

```ts
export const AvailableSpaceKind = Object.freeze({
  Definite: 0,
  MinContent: 1,
  MaxContent: 2,
} as const);

export type AvailableSpaceInput =
  | number
  | {
      kind: typeof AvailableSpaceKind.Definite;
      value: number;
    }
  | {
      kind: typeof AvailableSpaceKind.MinContent;
    }
  | {
      kind: typeof AvailableSpaceKind.MaxContent;
    };

export type AvailableSpace =
  | {
      readonly kind: typeof AvailableSpaceKind.Definite;
      readonly value: number;
    }
  | {
      readonly kind: typeof AvailableSpaceKind.MinContent;
    }
  | {
      readonly kind: typeof AvailableSpaceKind.MaxContent;
    };
```

The same-named value namespace continues to provide `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent` conveniences that produce the complete records; callers may also provide equivalent ordinary mutable records directly. A number is only a shorter equivalent of `AvailableSpace.Definite(value)`. Layout options therefore take `SizeInput<AvailableSpaceInput>`, while the measure callback receives `Size<AvailableSpace>`. Complete input and output share the same numeric `kind` vocabulary so callback values can be narrowed with an ordinary `switch` and reused as later input without translating tags.

Both a direct number and `AvailableSpace.Definite(value)` apply the already selected ordinary `f64`-to-`f32` pass-through, including negative and non-finite values. A missing definite payload, an unknown kind, a string, a symbol, or another unsupported JavaScript type is not an `AvailableSpaceInput`. The content variants do not read a payload; an extra input property named `value` does not change their mapping and is not reproduced in output. The binding does not reserve any JavaScript number as a special encoding, pack variants into numeric payload bits, or introduce a separate primitive-symbol vocabulary. Exact numeric kind codes come from the shared generator input. The two fieldless conveniences are shared frozen objects, but whole-record identity has no semantic meaning. Readonly callback values are materialized eagerly as ordinary objects.

Representative behavior cases cover numeric shorthand and `AvailableSpace.Definite(value)` equivalence, direct records and all three conveniences, invalid kind and payload rejection, inactive payload handling, numeric conversion, helper materialization, output-to-input reuse, and output shapes. Type tests cover the input shorthand and public output-union narrowing without copying the complete generated numeric-family table.

### Selected Grid representation

Grid introduces no new boundary category. Its fieldless `GridAutoFlow` family exposes `Row`, `Column`, `RowDense`, and `ColumnDense` numeric constants whose type is their literal union. Its data-carrying variants use ordinary numeric-tagged records with the same discriminator rule, its fixed geometry uses the selected partial `Line` input, its floats use the selected `f32` pass-through, its Rust integers use exact representability checks, and its collections are copied ordinary JavaScript arrays. Collection-valued input properties accept readonly arrays because conversion only reads them, so mutable arrays, const-authored arrays, and binding snapshots can all be supplied without a cast. Every unsuffixed output type is the complete recursive readonly mirror using stored values.

```ts
export type GridPlacementInput =
  | { kind: typeof GridPlacementKind.Auto }
  | { kind: typeof GridPlacementKind.Line; index: number }
  | { kind: typeof GridPlacementKind.NamedLine; name: string; index: number }
  | { kind: typeof GridPlacementKind.Span; span: number }
  | { kind: typeof GridPlacementKind.NamedSpan; name: string; span: number };

export type MinTrackSizingFunctionInput =
  | { kind: typeof TrackSizingKind.Length; value: number }
  | { kind: typeof TrackSizingKind.Percent; value: number }
  | { kind: typeof TrackSizingKind.Auto }
  | { kind: typeof TrackSizingKind.MinContent }
  | { kind: typeof TrackSizingKind.MaxContent };

export type MaxTrackSizingFunctionInput =
  | MinTrackSizingFunctionInput
  | { kind: typeof TrackSizingKind.FitContent; value: LengthPercentageInput }
  | { kind: typeof TrackSizingKind.Fr; value: number };

export interface TrackSizingFunctionInput {
  min: MinTrackSizingFunctionInput;
  max: MaxTrackSizingFunctionInput;
}

export type RepetitionCountInput =
  | { kind: typeof RepetitionCountKind.Count; value: number }
  | { kind: typeof RepetitionCountKind.AutoFill }
  | { kind: typeof RepetitionCountKind.AutoFit };

export interface GridTemplateRepetitionInput {
  count: RepetitionCountInput;
  tracks: TrackSizingFunctionInput[];
  lineNames: string[][];
}

export type GridTemplateComponentInput =
  | { kind: typeof GridTemplateComponentKind.Single; value: TrackSizingFunctionInput }
  | { kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetitionInput };

export interface GridTemplateAreasInput {
  areas: GridTemplateAreaInput[];
  rowCount: number;
  columnCount: number;
}

export interface GridTemplateAreaInput {
  name: string;
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}
```

`GridPlacementKind` has `Auto`, `Line`, `NamedLine`, `Span`, and `NamedSpan`. The same-named value namespace provides `GridPlacement.Auto`, `GridPlacement.Line(index)`, `GridPlacement.NamedLine(name, index)`, `GridPlacement.Span(span)`, and `GridPlacement.NamedSpan(name, span)`. `gridRow` and `gridColumn` accept `PartialLineInput<GridPlacementInput>`: omitted `start` or `end` uses that component of the default `Auto` line. There is no scalar whole-line form, because `{ start: GridPlacement.Line(2) }` already expresses the useful one-sided convenience without assigning an implicit second meaning to one placement value.

`TrackSizingKind` has `Length`, `Percent`, `Auto`, `MinContent`, `MaxContent`, `FitContent`, and `Fr`. Minimum track sizing excludes `FitContent` and `Fr`; maximum track sizing admits all seven kinds. `Length`, `Percent`, and `Fr` carry scalar numbers, with percentages using the same user-facing magnitudes selected for semantic lengths. `FitContent` carries a complete `LengthPercentageInput`, not a CSS string or calc expression. A direct `TrackSizingFunctionInput` always contains both `min` and `max`. The `TrackSizingFunction.Length`, `Percent`, `Auto`, `MinContent`, `MaxContent`, `FitContent`, `Fr`, and `MinMax` conveniences all construct that same full pair. Following Taffy's public conversions, the first five ordinary scalar or intrinsic conveniences use the corresponding kind for both sides, while `FitContent` and `Fr` use `Auto` for `min` and the requested kind for `max`. Output is the stored full pair and does not preserve helper history.

`RepetitionCountKind` has `Count`, `AutoFill`, and `AutoFit`, with matching `RepetitionCount.Count(value)`, `AutoFill`, and `AutoFit` conveniences. `GridTemplateComponentKind` has `Single` and `Repeat`, and every component is tagged: a raw `TrackSizingFunctionInput` is not silently accepted as another `Single` spelling. `GridTemplateComponent.Single(value)` takes one complete track pair. `GridTemplateComponent.Repeat(count, tracks, lineNames = [])` constructs a complete repetition. A direct repetition value must contain `count`, `tracks`, and `lineNames`; the convenience default does not make that field optional in the ordinary record. Empty internal line names are semantically useful and remain the helper default, but the complete Style converter must handle the pinned Taffy panic combination described below before native computation can observe it.

The Style fields `gridTemplateRows` and `gridTemplateColumns` use readonly arrays of `GridTemplateComponentInput`; `gridAutoRows` and `gridAutoColumns` use readonly arrays of complete `TrackSizingFunctionInput`; `gridTemplateRowNames` and `gridTemplateColumnNames` use nested readonly string arrays; and nullable `gridTemplateAreas` uses the normalized record shown above or `null`. These declarations accept both mutable and readonly arrays and do not freeze the caller's runtime values. Output arrays and every nested record are recursively readonly, contain the actual stored strings and values, and use the corresponding unsuffixed types. Conversion copies every nested string, record, and array and finishes the complete Style before mutation.

Every grid `f32` payload follows the existing JavaScript-number-only rounding and semantic pass-through rule. An `i16` line index and every `u16` span, repetition count, template dimension, and area coordinate accept only a JavaScript number that is finite, integral, and exactly within the corresponding Rust range. They are not clamped, truncated, wrapped, or coerced. This validation means “the selected Rust value can be constructed,” not “the grid is sensible”: representable zero values, unusual area-coordinate relationships, most empty collections, multiple auto repetitions, nonfixed auto-repeat tracks, and other combinations that Taffy can safely receive pass through. The binding does not copy Taffy's internal 10,000-track computation cap into the JavaScript boundary. Strings map directly to Taffy's custom-identifier storage without CSS custom-ident grammar validation. There is no CSS text parser, array-to-CSS shorthand, or additional scalar shorthand.

Pinned Taffy 0.13 has one known collection-shape exception to pass-through. Its named-line resolver visits repeat components only while iterating the corresponding top-level `gridTemplateRowNames` or `gridTemplateColumnNames`. If that iteration reaches a repetition whose resolved count can be positive while its internal `lineNames` array is empty, the resolver's `current_line -= 1` bookkeeping can underflow and panic in a debug build. The complete Style converter must either reject that concrete cross-field combination with a controlled error or supply the semantically empty line-name sets Taffy expects, normally `tracks.length + 1` empty sets, before native state can be used. It must not reject other empty or mismatched collections merely for CSS conformance. This is a pinned implementation safety exception, not a new public grid-validity policy.

Each tagged branch declares only the fields that its selected variant needs. It does not add `value?: never`, `index?: never`, or similar exclusions for other variants. Conversion reads the selected discriminator and its required payload; unrelated extra structural properties are caller responsibility and are absent from canonical output. This rule is separate from ignored unknown properties on the outer `StyleInput` and strict field names on partial geometry records.

Acceptance cases cover every discriminator and convenience, complete pair normalization, user-facing percentage conversion, canonical output with no helper history, exact `i16` and `u16` boundaries, rejection of fractional and out-of-range integer payloads, zero-value pass-through, arbitrary JavaScript strings, mutable and readonly nested input arrays, recursive readonly output, direct output-to-input reuse, safely forwardable empty and nested collections, nullable template areas, ignored unrelated tagged-branch properties, full conversion before replacement, and the specific empty-repeat-line-names underflow regression in both axes. CSS-invalid structure is not by itself a rejection reason, but any concrete collection relationship found to reach a panic must be rejected or converted safely under the binding-wide safety rule.

### Derivation sequence

The case reached closure through four layers, each reusing the previous rules:

1. Fix the outer container, default, absence, unknown-field, replacement, and mutation-boundary semantics above.
2. Map scalar, closed-enum, alignment, geometry, semantic-length, and grid families, including canonical input and output forms and numeric conversion.
3. Confirm that every currently known Style type belongs to one of those families. The complete inventory belongs in maintained source and conversion code; behavior tests cover representative categories instead of copying the inventory. Only a value that does not fit an established family would add a new alignment question.
4. Select the complete plain-object `Style` snapshot as the value contract. Direct reads materialize it immediately; measured callback evidence may change when conversion happens without reopening its field mapping or detached-value semantics.

### Selected mapping categories

Representations follow semantic role rather than copy Rust declaration kinds mechanically:

| Category                         | Style examples                                                                                     | Selected rule                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean and numeric scalars      | `item_is_table`, `item_is_replaced`, `scrollbar_width`, `aspect_ratio`, `flex_grow`, `flex_shrink` | Selected direct numeric pass-through, explicit `f64`-to-`f32` conversion, and absence semantics.                                                                    |
| Closed keywords                  | `display`, `box_sizing`, `overflow`, `position`, `flex_direction`, `grid_auto_flow`                | Stable member names and codes, shared definition generation, and exhaustive validation without exposing Rust discriminants.                                         |
| Alignment values                 | `align_items`, `align_content`, and their aliases                                                  | Selected flattened numeric-literal `AlignItems` and `AlignContent` families containing only Taffy's named public combinations.                                      |
| Geometry records                 | `Point<Overflow>`, `Size<Dimension>`, `Rect<LengthPercentageAuto>`, `Line<GridPlacement>`          | Selected named complete input, Style-only partial input, and complete readonly output types with concrete runtime converters behind truthful TypeScript generics.   |
| Semantic lengths and track sizes | `Dimension`, `LengthPercentage`, `LengthPercentageAuto`, and track sizing functions                | Selected numeric shorthand plus complete tagged semantic lengths, and full min/max track pairs with numeric-tagged intrinsic, fractional, and fit-content variants. |
| Grid payloads and collections    | template tracks, repetitions, areas, line names, and placements                                    | Selected numeric-tagged payloads, exact Rust integer bounds, ordinary identifier strings, recursively copied collections, and Taffy-owned safe semantic edge cases. |

### Input and output are separate decisions

`StyleInput` is a mutable input convenience around a complete Rust value and may omit defaulted fields. The `getStyle(node)` method reads Taffy's complete stored Style and returns an owned readonly `Style` snapshot, and a measure callback's `getStyle()` function returns the same complete readonly value semantics. Each result is a newly materialized ordinary plain object. It is not frozen, sealed, proxied, cached, or a mutable view of tree state. Input and output still have different declaration shapes and defaulting semantics even though both use ordinary objects.

Output cost must be evaluated in the concrete path that pays it. Direct `getStyle(node)` remains eager, while measured `computeLayout` creates the JavaScript Style only when the callback calls `getStyle()`. The provider owns a Rust Style snapshot so it can be retained safely, and every call returns a new detached result. Selecting fields from direct reads, batching nodes, or introducing another representation remain separate optimizations that require their own evidence. Runtime sealing, freezing, and a JavaScript Style cache are not part of this boundary.

### Closure and escalation rule

Case 2 is complete because it demonstrates how a later agent can determine a known field's JavaScript representation, defaults, validation, conversion direction, and copying from its established semantic category. Another alignment example should not repeat the same reasoning merely because an API has more fields or more occurrences of those categories.

A later alignment case needs explicit discussion only when evidence introduces a semantic category these rules cannot express, an ambiguous public input meaning, a new state owner or retained JavaScript lifetime, new callback behavior, a pointer-backed value, a distinct grammar, a known panic whose safe treatment would change public semantics, or a representation change with observably different behavior. Otherwise the existing mapping reference already supplies the answer.

### Retrospective

This case paid for several corrections that should prevent later mapping work from repeating the same detours:

- The first Style boundary proposals spent complexity on getter and Proxy side effects and repeated NodeId checks. That was over-defensive for the intended ordinary-object API. Begin with ordinary data objects and add a special boundary only for normal supported behavior, a concrete lifetime requirement, or evidence of a safety failure.
- The `null` and `undefined` discussion became needlessly abstract by introducing “sentinel” terminology and a three-way impossibility claim before stating observable behavior. Start with the field example: omission and `undefined` select the default, `null` selects `None` only for a nullable field, and output represents `None` as `null`.
- A primitive symbol proposal for `AvailableSpace` optimized one tag before considering JSON and structured clone. The later mistake was requiring input and output to share one shape. Treat them separately: a direct input number can mean `Definite`, explicit objects can represent the content variants, and complete output can remain tagged.
- The first selective-query prototype used raw numeric discriminators, but the draft API still specified branded intersections and incorrectly assumed the same control-flow narrowing. Even though the query optimization is deferred, the lesson remains general: test declaration claims with the exact public type shape because TypeScript 5.9 and 7.0 narrow ordinary numeric literals but not the branded intersection, and requiring `isVariant` would move that mismatch into every user's code.
- Optional-`never` properties attempted to emulate exact object types across every tagged branch. They multiplied declaration noise without protecting the ordinary runtime path, so branches now declare only the payloads they consume and leave unrelated structural extras to the caller.
- Early numeric discussion mixed JavaScript-to-Rust representability with layout-domain validation. The binding checks that a selected Rust value can be constructed and prevents known panics; Taffy owns safe downstream semantics, including unusual finite, negative, or non-finite floating-point values.
- Requiring callback-path measurement before choosing any Style output representation made an optimization question block a usable baseline. Choose the simplest truthful owned representation first. Unretained prototypes suggested that selective conversion could be cheaper, but they established neither a durable performance result nor a consumer bottleneck that justifies an initial optimization API.
- The first Grid summary treated empty line-name collections too broadly as safe. Source review found a specific reachable Taffy 0.13 underflow, so the exception is recorded narrowly without turning CSS conformance into binding validation.
- Interpreting the end of this example as a transition toward implementation imported an unrelated project-phase question. An alignment case is complete when it has yielded its reusable distinctions and stop conditions; the next question is whether another example would exercise a new distinction.
- Selecting a direction and vouching exact recorded words are separate acts. A human vouch applies only to the reviewed wording, and later edits that alter its scope or content must remove the stamp until the revised text is explicitly re-vouched.

### Questions outside this example

The shared definition and stable codes that this case originally left open are now owned by [API code generation](api-codegen.md). Whether another callback should expose a selective Style contract remains separate; the direct measure callback keeps complete Style capability through `getStyle()` without eagerly converting it.

### Evidence

- [Taffy Style definition and defaults](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/mod.rs)
- [Taffy semantic length types](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/dimension.rs)
- [Taffy alignment types](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/alignment.rs)
- [CSS Box Alignment overflow-position values](https://www.w3.org/TR/css-align-3/#overflow-values)
- [Taffy geometry types](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/geometry.rs)
- [Taffy grid Style types](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/grid.rs)
- [Yoga 3.2.1 JavaScript wrapper](https://github.com/facebook/yoga/blob/v3.2.1/javascript/src/wrapAssembly.ts)
- [Yoga 3.2.1 native Style normalization](https://github.com/facebook/yoga/blob/v3.2.1/yoga/style/Style.h)
- [TaffyTree Style operations and measurement](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [napi-rs object conversion](https://napi.rs/docs/concepts/type-conversions)
- [napi-rs enum conversion](https://napi.rs/docs/concepts/enum)
- [TypeScript enum objects and const-enum publication pitfalls](https://www.typescriptlang.org/docs/handbook/enums)
- [TypeScript numeric-enum compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility#enums)
- [Node-API numeric conversion behavior](https://nodejs.org/api/n-api.html#napi_get_value_int32)
- [Yoga's generated JavaScript enum vocabulary](https://github.com/react/yoga/blob/main/javascript/src/generated/YGEnums.ts)
- [TypeScript `exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)

## Case 3: Measurement callback, node context, and failure semantics

This case applies the API-design method to control inversion: measured `computeLayout` enters Taffy, Taffy synchronously calls JavaScript while computation is in progress, and JavaScript returns data or fails before native computation has naturally completed. It tests reasoning that the state-and-identity case and the value-mapping case do not exercise.

The case inherits the vouched direct computation signature, JavaScript-owned node-context model, `undefined`-means-absence rule, same-tree busy error, and the value representations established by Case 2. It does not reopen those decisions without new evidence. It determines how those rules compose in complete observable sequences.

### Questions to test

- What public node-context operations are needed for the direct measurement flow, and who is responsible for dirtying after context or externally captured measurement data changes?
- What must a complete measure result contain, and how does an invalid result cross a Rust closure whose Taffy signature is infallible?
- How does a JavaScript exception stop measurement, what error reaches the caller, and what native layout and cache state may be read or reused afterward?
- Which callback side effects are intentionally preserved even when measurement later fails, and which binding-owned state changes must remain consistent?
- Which facts follow mechanically from the existing owned-input, scalar, NodeId, and re-entry rules, and which introduce a genuinely new public contract?

### Selected context ownership and invalidation

The direct context and invalidation surface uses `newLeafWithContext(context, style?)`, `getNodeContext(node)`, `setNodeContext(node, context)`, `markDirty(node)`, and `isDirty(node)`. The context parameter and result use `TContext | undefined` under the already vouched absence rule. `getNodeContext` returns the exact JavaScript value stored by the caller rather than a copy, readonly view, or binding-produced snapshot; JavaScript already provides ordinary mutable access, so Rust's `get_node_context_mut` and `get_disjoint_node_context_mut` do not become separate public operations.

`setNodeContext` keeps the JavaScript registry and Taffy's context-presence metadata consistent, returns `void`, and always marks the node dirty even if the supplied JavaScript value is referentially or primitively equal to the previous value. The binding must not compare context values to suppress Taffy's invalidation behavior. The later per-node measurement API stores an independent measure-presence bit in the same native metadata; clearing either flag must preserve the other.

In-place mutation of a stored context object and changes to data captured by a measure callback are invisible to the binding. The caller must invoke `markDirty(node)` for every affected node before relying on another computation. Adding, removing, or changing a call-scoped fallback on `computeLayout` does not automatically dirty nodes because callback identity and fallback presence are not part of Taffy's cache key. Every potentially affected leaf must be dirtied; `markDirty(root)` is insufficient because it does not clear descendants. The later `setMeasure` API deliberately does dirty on every set, replacement, or clear, including the same function identity, because the setter is an explicit measurement-state mutation. `markDirty` accepts any valid node and directly preserves Taffy's behavior of clearing that node's cache and propagating invalidation through its ancestors; it does not copy Yoga's measured-leaf-only restriction.

`isDirty(node)` directly returns Taffy's `dirty(node)` result: whether that node's cache is empty. This is ordinary Taffy behavior rather than a restricted taffyjs variant or a separate freshness policy. The already selected stored-layout semantics continue to apply independently: layout reads return the value Taffy currently stores until another computation updates it.

### Selected callback invocation and context-side effects

The measure function is a synchronous query controlled by Taffy, not an exactly-once node event. The wrapper requires it to be a function before entering native computation, including when cached work means Taffy would not invoke it. Cache reuse and layout traversal may cause a node not to be measured, to be measured once, or to be measured multiple times with different known dimensions or available-space constraints. taffyjs does not add a stable cross-node ordering or call-count guarantee.

Because `context` is the exact caller-owned JavaScript value, ordinary direct mutation inside the callback remains observable. taffyjs does not interpret arbitrary JavaScript changes as layout invalidation or roll them back. Native operations on the same tree, including `setNodeContext` and `markDirty`, remain unavailable while the compute is active, so a callback-side mutation that changes future measurement semantics requires the caller to mark the affected node dirty after the compute returns. Measurement-local memoization that does not change the node's semantic measured size does not require invalidation.

These are callback-boundary facts rather than a recommended side-effectful measurement pattern. An ordinary measure callback only needs to read its inputs and return a size, and its public JSDoc needs only a compact warning against relying on invocation count, ordering, or automatic invalidation.

### Selected measure-result mapping

The synchronous measure function returns a complete mutable `SizeInput<number>` ordinary object with required `width` and `height` properties. A missing or explicit-`undefined` axis, `null`, another non-number payload, an array, a Promise or other unsupported whole-value shape, and an unknown geometry component produce a controlled `TypeError`. The callback result does not gain Style partiality, scalar expansion, coercion, asynchronous settlement, or a Yoga-style missing-axis fallback.

Each axis follows the vouched scalar mapping: read one JavaScript `number`, convert it to Taffy's `f32` with ordinary rounding, and pass negative values, `NaN`, infinities, and finite values that overflow to `f32` infinity without semantic validation or normalization. These values are successful measure results rather than callback failures.

### Selected callback-failure boundary

The first JavaScript exception or measure-result conversion failure ends user callback participation in that compute. The binding retains that first failure, does not invoke the user's callback again during the same compute, and supplies an internal zero size to any remaining Taffy measure calls only so Taffy's infallible closure and native call stack can finish normally. It must not use a Rust panic as the ordinary callback-error path.

After Taffy returns, the binding clears the caches of every node in the requested root's subtree, with Taffy's ordinary ancestor propagation, so a later compute cannot reuse results produced through the internal fallback. `computeLayout` then throws synchronously. A value thrown by the callback is propagated without a new taffyjs wrapper; a malformed return produces an ordinary `TypeError` without a dedicated stable binding error code. The exact diagnostic text is not a compatibility promise.

The tree is immediately usable after the throw and does not acquire a poisoned state. The binding does not promise transactional Layout rollback: `getLayout(node)` continues to return whichever value Taffy currently stores, and only a later successful compute establishes the result of another complete computation. JavaScript side effects and mutations to caller-owned context values that occurred before failure remain observable. Providing old-Layout rollback would require hidden whole-tree state preservation on every measured compute, so the direct path does not pay that normal-path cost solely for callback failure.

### Reusable control-inversion model

Case 3 establishes that a callback boundary must be designed as a complete observable sequence rather than only as a TypeScript function signature. A later agent should determine five things in order:

- Who controls whether, when, and how often the callback runs, including cache reuse and changing constraints.
- Who owns every callback argument and retained value, and whether identity, copying, or absence is observable.
- Which owner operations remain valid while the callback is active and which native invariant rejects re-entry.
- How a successful return is converted and how a JavaScript failure crosses the upstream callback's actual return type.
- Which JavaScript, binding-owned, cached, and upstream states remain observable or require invalidation after failure.

For this direct synchronous Taffy path, those answers are: Taffy controls measurement scheduling; JavaScript owns the exact context while borrowed Rust inputs become owned values or, for Style, one provider-owned snapshot per callback-reached node and compute; same-tree native access is busy while independent JavaScript values, retained Style providers, and other trees remain usable; the callback returns one complete `SizeInput<number>`; and the first callback failure is preserved while Taffy's infallible stack drains, the attempted subtree's caches are invalidated, and arbitrary JavaScript side effects and stored Layout are not rolled back. Once these sequence boundaries are fixed, the record, scalar, enum, readonly-output, and ordinary-object rules from Case 2 apply mechanically to materialized callback payloads.

### Closure and escalation rule

Case 3 is complete because it defines the direct measurement flow on success, on invalid return, on a thrown JavaScript value, during same-tree re-entry, after context mutation, under cache reuse, and after failure. Further enumeration of Style fields or callback argument components would repeat Case 2 rather than test another control-inversion decision.

A later synchronous per-compute callback with the same ownership, scheduling, cache, re-entry, and infallible-return shape should reuse this sequence model without another field-by-field approval pass. It still must verify the upstream implementation before copying the concrete zero-drain or invalidation scope.

Explicit discussion is required when a callback is retained beyond one call, can run asynchronously or on another thread, supports cancellation, is allowed by the upstream API to mutate or re-enter the owner, makes invocation count or ordering part of the public meaning, changes JavaScript-value ownership, has a fallible upstream return channel, uses a different cache owner or invalidation scope, or promises transactional rollback. Those are new contracts rather than unresolved parts of this case.

### Retrospective

This case produced several corrections that should guide later callback alignment:

- Calling `isDirty` “semantically restricted” obscured the answer when the selected behavior was simply Taffy's own dirty query. State the direct upstream behavior first; introduce a restriction only when the binding actually narrows it.
- `setNodeContext` initially felt awkward because JavaScript callers commonly mutate object properties. Separating replacement from mutation resolved the mismatch: the setter replaces the stored value and inherits Taffy's automatic dirtying, while mutation preserves object identity and requires explicit invalidation because the binding cannot observe it.
- A generic Rust context parameter did not require Rust to own an arbitrary JavaScript value. Separating the native presence marker from the authoritative JavaScript registry preserved both Taffy's measurement capability and JavaScript identity without unnecessary native retention.
- Type declarations and documentation cannot enforce Rust aliasing when a synchronous JavaScript callback captures its tree. The checked native borrow and controlled busy error are required safety boundaries, unlike speculative defenses against unusual ordinary-object getters or Proxies.
- Saying only that a callback “throws” was insufficient because Taffy's closure cannot return an error. The bridge had to define the entire failure path: preserve the first failure, stop user callbacks, leave the native stack normally, invalidate affected caches, rethrow, and avoid promising rollback of unrelated state.
- Yoga was useful comparative evidence but did not decide this Rust ownership boundary. A direct binding follows Taffy's behavior unless the JavaScript boundary needs a concrete representation, lifetime, or safety decision.
- Invocation count, ordering, and context-side-effect facts deserve a precise internal record so future work does not invent event semantics or automatic dirtying, but they need only a compact user-facing warning and should not make ordinary measurement look ceremonial.
- The accessor discussion exposed a general naming rule rather than a callback-specific exception: value reads use `get`, predicates keep `is` or `has`, and actions retain verb-led names. Later APIs should apply that convention mechanically.

### Later per-node extension

The implemented `setMeasure(node, callback | undefined)` extension reuses this case's synchronous argument, failure, re-entry, invalidation-after-failure, and retry sequence. JavaScript retains callbacks in a wrapper-owned `Map<NodeId, MeasureFunction>` while Rust stores only context and measure presence as independent booleans. `computeLayout` calls only marked nodes when its options omit `measure`, supplies that optional global fallback after the per-node callback when present, and retains its raw fast path only when neither source exists. Rust checks the marker before callback argument or `getStyle` provider construction and before crossing Node-API or WASI when no global fallback exists. Setter mutation is native-first and therefore leaves the JavaScript map unchanged on a busy-tree or other native failure; remove and clear release the matching callbacks and markers. Numeric slots, callback-table indices, generation schemes, and topology mirrors are not part of this extension.

Retaining a callback's owned `getStyle` provider remains supported and does not retain the tree or a Rust borrow; it is part of the current snapshot-delivery lifetime rather than a retained measurement callback. Automatically observed or proxy-backed context conveniences, asynchronous or off-thread layout, cancellation, batching, and a callback-specific selective-data contract remain separate contracts. Further compact callback-boundary experiments remain in the [performance TODO](api-alignment-todos.md#performance) and do not change this case's callback sequence.

### Evidence

- [TaffyTree context, dirty-state, and compute operations](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [Taffy root and cached layout computation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/compute/mod.rs)
- [Taffy leaf measurement](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/compute/leaf.rs)
- [Taffy per-node cache behavior](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/cache.rs)
- [napi-rs scoped function calls and pending-exception capture](https://github.com/napi-rs/napi-rs/blob/napi-v3.12.0/crates/napi/src/bindgen_runtime/js_values/function.rs)
- [napi-rs JavaScript exception retention](https://github.com/napi-rs/napi-rs/blob/napi-v3.12.0/crates/napi/src/error.rs)
- [Yoga 3.2.1 JavaScript measure wrapper](https://github.com/facebook/yoga/blob/v3.2.1/javascript/src/wrapAssembly.ts)
- [Yoga 3.2.1 native measure normalization](https://github.com/facebook/yoga/blob/v3.2.1/yoga/node/Node.cpp)
