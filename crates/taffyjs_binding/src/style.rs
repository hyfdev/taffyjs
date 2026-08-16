use napi::ValueType;
use napi::bindgen_prelude::{Either, Null, Unknown};
use napi_derive::napi;
use taffy::geometry::{Line, Point, Rect, Size};
use taffy::style::{
    AlignContent, AlignItems, BoxSizing, Clear, Direction, Display, FlexDirection, FlexWrap, Float,
    GridAutoFlow, Overflow, Position, Style, TextAlign,
};

use crate::error::{BindingResult, type_error};
use crate::numeric::{
    AlignContentCode, AlignItemsCode, BoxSizingCode, ClearCode, DirectionCode, DisplayCode,
    FlexDirectionCode, FlexWrapCode, FloatCode, GridAutoFlowCode, OverflowCode, PositionCode,
    TextAlignCode,
};
use crate::{geometry, grid, js_object, length, number};

pub(crate) const STYLE_FIELDS: &[&str] = &[
    "display",
    "itemIsTable",
    "itemIsReplaced",
    "boxSizing",
    "direction",
    "overflow",
    "scrollbarWidth",
    "float",
    "clear",
    "position",
    "inset",
    "size",
    "minSize",
    "maxSize",
    "aspectRatio",
    "margin",
    "padding",
    "border",
    "alignItems",
    "alignSelf",
    "justifyItems",
    "justifySelf",
    "alignContent",
    "justifyContent",
    "gap",
    "textAlign",
    "flexDirection",
    "flexWrap",
    "flexBasis",
    "flexGrow",
    "flexShrink",
    "gridTemplateRows",
    "gridTemplateColumns",
    "gridAutoRows",
    "gridAutoColumns",
    "gridAutoFlow",
    "gridTemplateAreas",
    "gridTemplateColumnNames",
    "gridTemplateRowNames",
    "gridRow",
    "gridColumn",
];

#[napi(object, object_to_js = false)]
pub struct StyleInput<'env> {
    pub display: Option<f64>,
    pub item_is_table: Option<bool>,
    pub item_is_replaced: Option<bool>,
    pub box_sizing: Option<f64>,
    pub direction: Option<f64>,
    // A nested napi-rs object would coerce arrays and primitives and ignore extra fields.
    pub overflow: Option<Unknown<'env>>,
    pub scrollbar_width: Option<f64>,
    #[napi(js_name = "float")]
    pub r#float: Option<f64>,
    pub clear: Option<f64>,
    pub position: Option<f64>,
    pub inset: Option<Unknown<'env>>,
    pub size: Option<Unknown<'env>>,
    pub min_size: Option<Unknown<'env>>,
    pub max_size: Option<Unknown<'env>>,
    pub aspect_ratio: Option<Either<f64, Null>>,
    pub margin: Option<Unknown<'env>>,
    pub padding: Option<Unknown<'env>>,
    pub border: Option<Unknown<'env>>,
    pub align_items: Option<Either<f64, Null>>,
    pub align_self: Option<Either<f64, Null>>,
    pub justify_items: Option<Either<f64, Null>>,
    pub justify_self: Option<Either<f64, Null>>,
    pub align_content: Option<Either<f64, Null>>,
    pub justify_content: Option<Either<f64, Null>>,
    pub gap: Option<Unknown<'env>>,
    pub text_align: Option<f64>,
    pub flex_direction: Option<f64>,
    pub flex_wrap: Option<f64>,
    pub flex_basis: Option<Unknown<'env>>,
    pub flex_grow: Option<f64>,
    pub flex_shrink: Option<f64>,
    pub grid_template_rows: Option<Vec<Unknown<'env>>>,
    pub grid_template_columns: Option<Vec<Unknown<'env>>>,
    pub grid_auto_rows: Option<Vec<Unknown<'env>>>,
    pub grid_auto_columns: Option<Vec<Unknown<'env>>>,
    pub grid_auto_flow: Option<f64>,
    pub grid_template_areas: Option<Either<grid::GridTemplateAreasInput, Null>>,
    pub grid_template_column_names: Option<Vec<Vec<String>>>,
    pub grid_template_row_names: Option<Vec<Vec<String>>>,
    pub grid_row: Option<Unknown<'env>>,
    pub grid_column: Option<Unknown<'env>>,
}

#[derive(Default)]
struct StylePresence {
    display: bool,
    item_is_table: bool,
    item_is_replaced: bool,
    box_sizing: bool,
    direction: bool,
    overflow: Option<Point<bool>>,
    scrollbar_width: bool,
    r#float: bool,
    clear: bool,
    position: bool,
    inset: Option<Rect<bool>>,
    size: Option<Size<bool>>,
    min_size: Option<Size<bool>>,
    max_size: Option<Size<bool>>,
    aspect_ratio: bool,
    margin: Option<Rect<bool>>,
    padding: Option<Rect<bool>>,
    border: Option<Rect<bool>>,
    align_items: bool,
    align_self: bool,
    justify_items: bool,
    justify_self: bool,
    align_content: bool,
    justify_content: bool,
    gap: Option<Size<bool>>,
    text_align: bool,
    flex_direction: bool,
    flex_wrap: bool,
    flex_basis: bool,
    flex_grow: bool,
    flex_shrink: bool,
    grid_template_rows: bool,
    grid_template_columns: bool,
    grid_auto_rows: bool,
    grid_auto_columns: bool,
    grid_auto_flow: bool,
    grid_template_areas: bool,
    grid_template_column_names: bool,
    grid_template_row_names: bool,
    grid_row: Option<Line<bool>>,
    grid_column: Option<Line<bool>>,
}

pub(crate) struct StylePatch {
    value: Style,
    presence: StylePresence,
}

#[napi(object, object_to_js = false)]
pub struct MaybeTaggedLengthInput {
    pub unit: Option<f64>,
}

#[napi(object, object_from_js = false)]
pub struct OverflowOutput {
    pub x: u8,
    pub y: u8,
}

#[napi(object, object_from_js = false)]
pub struct LengthSizeOutput {
    pub width: length::LengthOutput,
    pub height: length::LengthOutput,
}

#[napi(object, object_from_js = false)]
pub struct LengthRectOutput {
    pub left: length::LengthOutput,
    pub right: length::LengthOutput,
    pub top: length::LengthOutput,
    pub bottom: length::LengthOutput,
}

#[napi(object, object_from_js = false)]
pub struct GridPlacementLineOutput {
    pub start: grid::GridPlacementOutput,
    pub end: grid::GridPlacementOutput,
}

#[napi(object, use_nullable = true, object_from_js = false)]
pub struct StyleOutput {
    pub display: u8,
    pub item_is_table: bool,
    pub item_is_replaced: bool,
    pub box_sizing: u8,
    pub direction: u8,
    pub overflow: OverflowOutput,
    pub scrollbar_width: f64,
    #[napi(js_name = "float")]
    pub r#float: u8,
    pub clear: u8,
    pub position: u8,
    pub inset: LengthRectOutput,
    pub size: LengthSizeOutput,
    pub min_size: LengthSizeOutput,
    pub max_size: LengthSizeOutput,
    pub aspect_ratio: Option<f64>,
    pub margin: LengthRectOutput,
    pub padding: LengthRectOutput,
    pub border: LengthRectOutput,
    pub align_items: Option<u8>,
    pub align_self: Option<u8>,
    pub justify_items: Option<u8>,
    pub justify_self: Option<u8>,
    pub align_content: Option<u8>,
    pub justify_content: Option<u8>,
    pub gap: LengthSizeOutput,
    pub text_align: u8,
    pub flex_direction: u8,
    pub flex_wrap: u8,
    pub flex_basis: length::LengthOutput,
    pub flex_grow: f64,
    pub flex_shrink: f64,
    pub grid_template_rows: Vec<grid::GridTemplateComponentOutput>,
    pub grid_template_columns: Vec<grid::GridTemplateComponentOutput>,
    pub grid_auto_rows: Vec<grid::TrackSizingOutput>,
    pub grid_auto_columns: Vec<grid::TrackSizingOutput>,
    pub grid_auto_flow: u8,
    pub grid_template_areas: Option<grid::GridTemplateAreasOutput>,
    pub grid_template_column_names: Vec<Vec<String>>,
    pub grid_template_row_names: Vec<Vec<String>>,
    pub grid_row: GridPlacementLineOutput,
    pub grid_column: GridPlacementLineOutput,
}

fn integer<T>(value: f64) -> BindingResult<T>
where
    T: TryFrom<i64>,
{
    number::to_integer(value)
}

fn is_length_input(value: Unknown<'_>) -> BindingResult<bool> {
    let value_type = value
        .get_type()
        .map_err(|_| type_error("Expected a length or geometry object"))?;
    if value_type == ValueType::Number {
        return Ok(true);
    }
    if value_type != ValueType::Object {
        return Ok(false);
    }
    let input: MaybeTaggedLengthInput =
        js_object::input(value, "a length or geometry object", None)?;
    Ok(input.unit.is_some())
}

fn dimension_size(
    value: Unknown<'_>,
    default: Size<taffy::Dimension>,
) -> BindingResult<(Size<taffy::Dimension>, Size<bool>)> {
    if is_length_input(value)? {
        let value = length::dimension(value)?;
        Ok((
            Size {
                width: value,
                height: value,
            },
            Size {
                width: true,
                height: true,
            },
        ))
    } else {
        geometry::partial_size(value, default, length::dimension)
    }
}

fn auto_rect(
    value: Unknown<'_>,
    default: Rect<taffy::LengthPercentageAuto>,
) -> BindingResult<(Rect<taffy::LengthPercentageAuto>, Rect<bool>)> {
    if is_length_input(value)? {
        let value = length::length_percentage_auto(value)?;
        Ok((
            Rect {
                left: value,
                right: value,
                top: value,
                bottom: value,
            },
            Rect {
                left: true,
                right: true,
                top: true,
                bottom: true,
            },
        ))
    } else {
        geometry::partial_rect(value, default, length::length_percentage_auto)
    }
}

fn length_rect(
    value: Unknown<'_>,
    default: Rect<taffy::LengthPercentage>,
) -> BindingResult<(Rect<taffy::LengthPercentage>, Rect<bool>)> {
    if is_length_input(value)? {
        let value = length::length_percentage(value)?;
        Ok((
            Rect {
                left: value,
                right: value,
                top: value,
                bottom: value,
            },
            Rect {
                left: true,
                right: true,
                top: true,
                bottom: true,
            },
        ))
    } else {
        geometry::partial_rect(value, default, length::length_percentage)
    }
}

fn length_size(
    value: Unknown<'_>,
    default: Size<taffy::LengthPercentage>,
) -> BindingResult<(Size<taffy::LengthPercentage>, Size<bool>)> {
    if is_length_input(value)? {
        let value = length::length_percentage(value)?;
        Ok((
            Size {
                width: value,
                height: value,
            },
            Size {
                width: true,
                height: true,
            },
        ))
    } else {
        geometry::partial_size(value, default, length::length_percentage)
    }
}

fn display(value: f64) -> BindingResult<Display> {
    Ok(match integer::<DisplayCode>(value)? {
        DisplayCode::Block => Display::Block,
        DisplayCode::FlowRoot => Display::FlowRoot,
        DisplayCode::Flex => Display::Flex,
        DisplayCode::Grid => Display::Grid,
        DisplayCode::None => Display::None,
    })
}

fn box_sizing(value: f64) -> BindingResult<BoxSizing> {
    Ok(match integer::<BoxSizingCode>(value)? {
        BoxSizingCode::BorderBox => BoxSizing::BorderBox,
        BoxSizingCode::ContentBox => BoxSizing::ContentBox,
    })
}

fn direction(value: f64) -> BindingResult<Direction> {
    Ok(match integer::<DirectionCode>(value)? {
        DirectionCode::Ltr => Direction::Ltr,
        DirectionCode::Rtl => Direction::Rtl,
    })
}

fn overflow(value: f64) -> BindingResult<Overflow> {
    Ok(match integer::<OverflowCode>(value)? {
        OverflowCode::Visible => Overflow::Visible,
        OverflowCode::Clip => Overflow::Clip,
        OverflowCode::Hidden => Overflow::Hidden,
        OverflowCode::Scroll => Overflow::Scroll,
    })
}

fn float(value: f64) -> BindingResult<Float> {
    Ok(match integer::<FloatCode>(value)? {
        FloatCode::Left => Float::Left,
        FloatCode::Right => Float::Right,
        FloatCode::None => Float::None,
    })
}

fn clear(value: f64) -> BindingResult<Clear> {
    Ok(match integer::<ClearCode>(value)? {
        ClearCode::Left => Clear::Left,
        ClearCode::Right => Clear::Right,
        ClearCode::Both => Clear::Both,
        ClearCode::None => Clear::None,
    })
}

fn position(value: f64) -> BindingResult<Position> {
    Ok(match integer::<PositionCode>(value)? {
        PositionCode::Relative => Position::Relative,
        PositionCode::Absolute => Position::Absolute,
    })
}

fn align_items(value: f64) -> BindingResult<AlignItems> {
    Ok(match integer::<AlignItemsCode>(value)? {
        AlignItemsCode::Start => AlignItems::START,
        AlignItemsCode::End => AlignItems::END,
        AlignItemsCode::FlexStart => AlignItems::FLEX_START,
        AlignItemsCode::FlexEnd => AlignItems::FLEX_END,
        AlignItemsCode::SelfStart => AlignItems::SELF_START,
        AlignItemsCode::SelfEnd => AlignItems::SELF_END,
        AlignItemsCode::Center => AlignItems::CENTER,
        AlignItemsCode::Baseline => AlignItems::BASELINE,
        AlignItemsCode::Stretch => AlignItems::STRETCH,
        AlignItemsCode::SafeStart => AlignItems::SAFE_START,
        AlignItemsCode::SafeEnd => AlignItems::SAFE_END,
        AlignItemsCode::SafeFlexStart => AlignItems::SAFE_FLEX_START,
        AlignItemsCode::SafeFlexEnd => AlignItems::SAFE_FLEX_END,
        AlignItemsCode::SafeSelfStart => AlignItems::SAFE_SELF_START,
        AlignItemsCode::SafeSelfEnd => AlignItems::SAFE_SELF_END,
        AlignItemsCode::SafeCenter => AlignItems::SAFE_CENTER,
    })
}

fn align_content(value: f64) -> BindingResult<AlignContent> {
    Ok(match integer::<AlignContentCode>(value)? {
        AlignContentCode::Start => AlignContent::START,
        AlignContentCode::End => AlignContent::END,
        AlignContentCode::FlexStart => AlignContent::FLEX_START,
        AlignContentCode::FlexEnd => AlignContent::FLEX_END,
        AlignContentCode::Center => AlignContent::CENTER,
        AlignContentCode::Stretch => AlignContent::STRETCH,
        AlignContentCode::SpaceBetween => AlignContent::SPACE_BETWEEN,
        AlignContentCode::SpaceEvenly => AlignContent::SPACE_EVENLY,
        AlignContentCode::SpaceAround => AlignContent::SPACE_AROUND,
        AlignContentCode::SafeStart => AlignContent::SAFE_START,
        AlignContentCode::SafeEnd => AlignContent::SAFE_END,
        AlignContentCode::SafeFlexStart => AlignContent::SAFE_FLEX_START,
        AlignContentCode::SafeFlexEnd => AlignContent::SAFE_FLEX_END,
        AlignContentCode::SafeCenter => AlignContent::SAFE_CENTER,
    })
}

fn text_align(value: f64) -> BindingResult<TextAlign> {
    Ok(match integer::<TextAlignCode>(value)? {
        TextAlignCode::Auto => TextAlign::Auto,
        TextAlignCode::LegacyLeft => TextAlign::LegacyLeft,
        TextAlignCode::LegacyRight => TextAlign::LegacyRight,
        TextAlignCode::LegacyCenter => TextAlign::LegacyCenter,
    })
}

fn flex_direction(value: f64) -> BindingResult<FlexDirection> {
    Ok(match integer::<FlexDirectionCode>(value)? {
        FlexDirectionCode::Row => FlexDirection::Row,
        FlexDirectionCode::Column => FlexDirection::Column,
        FlexDirectionCode::RowReverse => FlexDirection::RowReverse,
        FlexDirectionCode::ColumnReverse => FlexDirection::ColumnReverse,
    })
}

fn flex_wrap(value: f64) -> BindingResult<FlexWrap> {
    Ok(match integer::<FlexWrapCode>(value)? {
        FlexWrapCode::NoWrap => FlexWrap::NoWrap,
        FlexWrapCode::Wrap => FlexWrap::Wrap,
        FlexWrapCode::WrapReverse => FlexWrap::WrapReverse,
    })
}

fn grid_auto_flow(value: f64) -> BindingResult<GridAutoFlow> {
    Ok(match integer::<GridAutoFlowCode>(value)? {
        GridAutoFlowCode::Row => GridAutoFlow::Row,
        GridAutoFlowCode::Column => GridAutoFlow::Column,
        GridAutoFlowCode::RowDense => GridAutoFlow::RowDense,
        GridAutoFlowCode::ColumnDense => GridAutoFlow::ColumnDense,
    })
}

fn field_changed<T: PartialEq>(present: bool, update: &T, current: &T) -> bool {
    present && update != current
}

fn f32_field_changed(present: bool, update: f32, current: f32) -> bool {
    present && update.to_bits() != current.to_bits()
}

fn optional_f32_field_changed(present: bool, update: Option<f32>, current: Option<f32>) -> bool {
    if !present {
        return false;
    }
    match (update, current) {
        (Some(update), Some(current)) => update.to_bits() != current.to_bits(),
        (None, None) => false,
        _ => true,
    }
}

fn point_changed<T: PartialEq>(
    present: &Point<bool>,
    update: &Point<T>,
    current: &Point<T>,
) -> bool {
    field_changed(present.x, &update.x, &current.x)
        || field_changed(present.y, &update.y, &current.y)
}

fn size_changed<T: PartialEq>(present: &Size<bool>, update: &Size<T>, current: &Size<T>) -> bool {
    field_changed(present.width, &update.width, &current.width)
        || field_changed(present.height, &update.height, &current.height)
}

fn rect_changed<T: PartialEq>(present: &Rect<bool>, update: &Rect<T>, current: &Rect<T>) -> bool {
    field_changed(present.left, &update.left, &current.left)
        || field_changed(present.right, &update.right, &current.right)
        || field_changed(present.top, &update.top, &current.top)
        || field_changed(present.bottom, &update.bottom, &current.bottom)
}

fn line_changed<T: PartialEq>(present: &Line<bool>, update: &Line<T>, current: &Line<T>) -> bool {
    field_changed(present.start, &update.start, &current.start)
        || field_changed(present.end, &update.end, &current.end)
}

fn preserve_field<T: Clone>(supplied: bool, update: &mut T, current: &T) {
    if !supplied {
        update.clone_from(current);
    }
}

fn preserve_point<T: Clone>(
    supplied: Option<Point<bool>>,
    update: &mut Point<T>,
    current: &Point<T>,
) {
    match supplied {
        Some(supplied) => {
            preserve_field(supplied.x, &mut update.x, &current.x);
            preserve_field(supplied.y, &mut update.y, &current.y);
        }
        None => update.clone_from(current),
    }
}

fn preserve_size<T: Clone>(supplied: Option<Size<bool>>, update: &mut Size<T>, current: &Size<T>) {
    match supplied {
        Some(supplied) => {
            preserve_field(supplied.width, &mut update.width, &current.width);
            preserve_field(supplied.height, &mut update.height, &current.height);
        }
        None => update.clone_from(current),
    }
}

fn preserve_rect<T: Clone>(supplied: Option<Rect<bool>>, update: &mut Rect<T>, current: &Rect<T>) {
    match supplied {
        Some(supplied) => {
            preserve_field(supplied.left, &mut update.left, &current.left);
            preserve_field(supplied.right, &mut update.right, &current.right);
            preserve_field(supplied.top, &mut update.top, &current.top);
            preserve_field(supplied.bottom, &mut update.bottom, &current.bottom);
        }
        None => update.clone_from(current),
    }
}

fn preserve_line<T: Clone>(supplied: Option<Line<bool>>, update: &mut Line<T>, current: &Line<T>) {
    match supplied {
        Some(supplied) => {
            preserve_field(supplied.start, &mut update.start, &current.start);
            preserve_field(supplied.end, &mut update.end, &current.end);
        }
        None => update.clone_from(current),
    }
}

impl StylePatch {
    fn changes(&self, current: &Style) -> bool {
        let update = &self.value;
        let present = &self.presence;
        field_changed(present.display, &update.display, &current.display)
            || field_changed(
                present.item_is_table,
                &update.item_is_table,
                &current.item_is_table,
            )
            || field_changed(
                present.item_is_replaced,
                &update.item_is_replaced,
                &current.item_is_replaced,
            )
            || field_changed(present.box_sizing, &update.box_sizing, &current.box_sizing)
            || field_changed(present.direction, &update.direction, &current.direction)
            || present
                .overflow
                .as_ref()
                .is_some_and(|present| point_changed(present, &update.overflow, &current.overflow))
            || f32_field_changed(
                present.scrollbar_width,
                update.scrollbar_width,
                current.scrollbar_width,
            )
            || field_changed(present.r#float, &update.float, &current.float)
            || field_changed(present.clear, &update.clear, &current.clear)
            || field_changed(present.position, &update.position, &current.position)
            || present
                .inset
                .as_ref()
                .is_some_and(|present| rect_changed(present, &update.inset, &current.inset))
            || present
                .size
                .as_ref()
                .is_some_and(|present| size_changed(present, &update.size, &current.size))
            || present
                .min_size
                .as_ref()
                .is_some_and(|present| size_changed(present, &update.min_size, &current.min_size))
            || present
                .max_size
                .as_ref()
                .is_some_and(|present| size_changed(present, &update.max_size, &current.max_size))
            || optional_f32_field_changed(
                present.aspect_ratio,
                update.aspect_ratio,
                current.aspect_ratio,
            )
            || present
                .margin
                .as_ref()
                .is_some_and(|present| rect_changed(present, &update.margin, &current.margin))
            || present
                .padding
                .as_ref()
                .is_some_and(|present| rect_changed(present, &update.padding, &current.padding))
            || present
                .border
                .as_ref()
                .is_some_and(|present| rect_changed(present, &update.border, &current.border))
            || field_changed(
                present.align_items,
                &update.align_items,
                &current.align_items,
            )
            || field_changed(present.align_self, &update.align_self, &current.align_self)
            || field_changed(
                present.justify_items,
                &update.justify_items,
                &current.justify_items,
            )
            || field_changed(
                present.justify_self,
                &update.justify_self,
                &current.justify_self,
            )
            || field_changed(
                present.align_content,
                &update.align_content,
                &current.align_content,
            )
            || field_changed(
                present.justify_content,
                &update.justify_content,
                &current.justify_content,
            )
            || present
                .gap
                .as_ref()
                .is_some_and(|present| size_changed(present, &update.gap, &current.gap))
            || field_changed(present.text_align, &update.text_align, &current.text_align)
            || field_changed(
                present.flex_direction,
                &update.flex_direction,
                &current.flex_direction,
            )
            || field_changed(present.flex_wrap, &update.flex_wrap, &current.flex_wrap)
            || field_changed(present.flex_basis, &update.flex_basis, &current.flex_basis)
            || f32_field_changed(present.flex_grow, update.flex_grow, current.flex_grow)
            || f32_field_changed(present.flex_shrink, update.flex_shrink, current.flex_shrink)
            || field_changed(
                present.grid_template_rows,
                &update.grid_template_rows,
                &current.grid_template_rows,
            )
            || field_changed(
                present.grid_template_columns,
                &update.grid_template_columns,
                &current.grid_template_columns,
            )
            || field_changed(
                present.grid_auto_rows,
                &update.grid_auto_rows,
                &current.grid_auto_rows,
            )
            || field_changed(
                present.grid_auto_columns,
                &update.grid_auto_columns,
                &current.grid_auto_columns,
            )
            || field_changed(
                present.grid_auto_flow,
                &update.grid_auto_flow,
                &current.grid_auto_flow,
            )
            || field_changed(
                present.grid_template_areas,
                &update.grid_template_areas,
                &current.grid_template_areas,
            )
            || field_changed(
                present.grid_template_column_names,
                &update.grid_template_column_names,
                &current.grid_template_column_names,
            )
            || field_changed(
                present.grid_template_row_names,
                &update.grid_template_row_names,
                &current.grid_template_row_names,
            )
            || present
                .grid_row
                .as_ref()
                .is_some_and(|present| line_changed(present, &update.grid_row, &current.grid_row))
            || present.grid_column.as_ref().is_some_and(|present| {
                line_changed(present, &update.grid_column, &current.grid_column)
            })
    }

    fn merge(self, current: &Style) -> Style {
        let mut update = self.value;
        let present = self.presence;
        preserve_field(present.display, &mut update.display, &current.display);
        preserve_field(
            present.item_is_table,
            &mut update.item_is_table,
            &current.item_is_table,
        );
        preserve_field(
            present.item_is_replaced,
            &mut update.item_is_replaced,
            &current.item_is_replaced,
        );
        preserve_field(
            present.box_sizing,
            &mut update.box_sizing,
            &current.box_sizing,
        );
        preserve_field(present.direction, &mut update.direction, &current.direction);
        preserve_point(present.overflow, &mut update.overflow, &current.overflow);
        preserve_field(
            present.scrollbar_width,
            &mut update.scrollbar_width,
            &current.scrollbar_width,
        );
        preserve_field(present.r#float, &mut update.float, &current.float);
        preserve_field(present.clear, &mut update.clear, &current.clear);
        preserve_field(present.position, &mut update.position, &current.position);
        preserve_rect(present.inset, &mut update.inset, &current.inset);
        preserve_size(present.size, &mut update.size, &current.size);
        preserve_size(present.min_size, &mut update.min_size, &current.min_size);
        preserve_size(present.max_size, &mut update.max_size, &current.max_size);
        preserve_field(
            present.aspect_ratio,
            &mut update.aspect_ratio,
            &current.aspect_ratio,
        );
        preserve_rect(present.margin, &mut update.margin, &current.margin);
        preserve_rect(present.padding, &mut update.padding, &current.padding);
        preserve_rect(present.border, &mut update.border, &current.border);
        preserve_field(
            present.align_items,
            &mut update.align_items,
            &current.align_items,
        );
        preserve_field(
            present.align_self,
            &mut update.align_self,
            &current.align_self,
        );
        preserve_field(
            present.justify_items,
            &mut update.justify_items,
            &current.justify_items,
        );
        preserve_field(
            present.justify_self,
            &mut update.justify_self,
            &current.justify_self,
        );
        preserve_field(
            present.align_content,
            &mut update.align_content,
            &current.align_content,
        );
        preserve_field(
            present.justify_content,
            &mut update.justify_content,
            &current.justify_content,
        );
        preserve_size(present.gap, &mut update.gap, &current.gap);
        preserve_field(
            present.text_align,
            &mut update.text_align,
            &current.text_align,
        );
        preserve_field(
            present.flex_direction,
            &mut update.flex_direction,
            &current.flex_direction,
        );
        preserve_field(present.flex_wrap, &mut update.flex_wrap, &current.flex_wrap);
        preserve_field(
            present.flex_basis,
            &mut update.flex_basis,
            &current.flex_basis,
        );
        preserve_field(present.flex_grow, &mut update.flex_grow, &current.flex_grow);
        preserve_field(
            present.flex_shrink,
            &mut update.flex_shrink,
            &current.flex_shrink,
        );
        preserve_field(
            present.grid_template_rows,
            &mut update.grid_template_rows,
            &current.grid_template_rows,
        );
        preserve_field(
            present.grid_template_columns,
            &mut update.grid_template_columns,
            &current.grid_template_columns,
        );
        preserve_field(
            present.grid_auto_rows,
            &mut update.grid_auto_rows,
            &current.grid_auto_rows,
        );
        preserve_field(
            present.grid_auto_columns,
            &mut update.grid_auto_columns,
            &current.grid_auto_columns,
        );
        preserve_field(
            present.grid_auto_flow,
            &mut update.grid_auto_flow,
            &current.grid_auto_flow,
        );
        preserve_field(
            present.grid_template_areas,
            &mut update.grid_template_areas,
            &current.grid_template_areas,
        );
        preserve_field(
            present.grid_template_column_names,
            &mut update.grid_template_column_names,
            &current.grid_template_column_names,
        );
        preserve_field(
            present.grid_template_row_names,
            &mut update.grid_template_row_names,
            &current.grid_template_row_names,
        );
        preserve_line(present.grid_row, &mut update.grid_row, &current.grid_row);
        preserve_line(
            present.grid_column,
            &mut update.grid_column,
            &current.grid_column,
        );
        update
    }
}

fn validate(style: &Style) -> BindingResult<()> {
    grid::validate_template_line_names(&style.grid_template_rows, &style.grid_template_row_names)?;
    grid::validate_template_line_names(
        &style.grid_template_columns,
        &style.grid_template_column_names,
    )?;
    Ok(())
}

pub(crate) fn patch(value: Unknown<'_>) -> BindingResult<StylePatch> {
    let input: StyleInput<'_> = js_object::input(value, "a Style object", Some(STYLE_FIELDS))?;
    let mut style = Style::default();
    let mut presence = StylePresence::default();

    if let Some(value) = input.display {
        style.display = display(value)?;
        presence.display = true;
    }
    if let Some(value) = input.item_is_table {
        style.item_is_table = value;
        presence.item_is_table = true;
    }
    if let Some(value) = input.item_is_replaced {
        style.item_is_replaced = value;
        presence.item_is_replaced = true;
    }
    if let Some(value) = input.box_sizing {
        style.box_sizing = box_sizing(value)?;
        presence.box_sizing = true;
    }
    if let Some(value) = input.direction {
        style.direction = direction(value)?;
        presence.direction = true;
    }
    if let Some(value) = input.overflow {
        let (value, fields) = geometry::partial_point(value, style.overflow, overflow)?;
        style.overflow = value;
        presence.overflow = Some(fields);
    }
    if let Some(value) = input.scrollbar_width {
        style.scrollbar_width = number::to_f32(value);
        presence.scrollbar_width = true;
    }
    if let Some(value) = input.r#float {
        style.float = float(value)?;
        presence.r#float = true;
    }
    if let Some(value) = input.clear {
        style.clear = clear(value)?;
        presence.clear = true;
    }
    if let Some(value) = input.position {
        style.position = position(value)?;
        presence.position = true;
    }
    if let Some(value) = input.inset {
        let (value, fields) = auto_rect(value, style.inset)?;
        style.inset = value;
        presence.inset = Some(fields);
    }
    if let Some(value) = input.size {
        let (value, fields) = dimension_size(value, style.size)?;
        style.size = value;
        presence.size = Some(fields);
    }
    if let Some(value) = input.min_size {
        let (value, fields) = dimension_size(value, style.min_size)?;
        style.min_size = value;
        presence.min_size = Some(fields);
    }
    if let Some(value) = input.max_size {
        let (value, fields) = dimension_size(value, style.max_size)?;
        style.max_size = value;
        presence.max_size = Some(fields);
    }
    if let Some(value) = input.aspect_ratio {
        style.aspect_ratio = match value {
            Either::A(value) => Some(number::to_f32(value)),
            Either::B(_) => None,
        };
        presence.aspect_ratio = true;
    }
    if let Some(value) = input.margin {
        let (value, fields) = auto_rect(value, style.margin)?;
        style.margin = value;
        presence.margin = Some(fields);
    }
    if let Some(value) = input.padding {
        let (value, fields) = length_rect(value, style.padding)?;
        style.padding = value;
        presence.padding = Some(fields);
    }
    if let Some(value) = input.border {
        let (value, fields) = length_rect(value, style.border)?;
        style.border = value;
        presence.border = Some(fields);
    }
    if let Some(value) = input.align_items {
        style.align_items = match value {
            Either::A(value) => Some(align_items(value)?),
            Either::B(_) => None,
        };
        presence.align_items = true;
    }
    if let Some(value) = input.align_self {
        style.align_self = match value {
            Either::A(value) => Some(align_items(value)?),
            Either::B(_) => None,
        };
        presence.align_self = true;
    }
    if let Some(value) = input.justify_items {
        style.justify_items = match value {
            Either::A(value) => Some(align_items(value)?),
            Either::B(_) => None,
        };
        presence.justify_items = true;
    }
    if let Some(value) = input.justify_self {
        style.justify_self = match value {
            Either::A(value) => Some(align_items(value)?),
            Either::B(_) => None,
        };
        presence.justify_self = true;
    }
    if let Some(value) = input.align_content {
        style.align_content = match value {
            Either::A(value) => Some(align_content(value)?),
            Either::B(_) => None,
        };
        presence.align_content = true;
    }
    if let Some(value) = input.justify_content {
        style.justify_content = match value {
            Either::A(value) => Some(align_content(value)?),
            Either::B(_) => None,
        };
        presence.justify_content = true;
    }
    if let Some(value) = input.gap {
        let (value, fields) = length_size(value, style.gap)?;
        style.gap = value;
        presence.gap = Some(fields);
    }
    if let Some(value) = input.text_align {
        style.text_align = text_align(value)?;
        presence.text_align = true;
    }
    if let Some(value) = input.flex_direction {
        style.flex_direction = flex_direction(value)?;
        presence.flex_direction = true;
    }
    if let Some(value) = input.flex_wrap {
        style.flex_wrap = flex_wrap(value)?;
        presence.flex_wrap = true;
    }
    if let Some(value) = input.flex_basis {
        style.flex_basis = length::dimension(value)?;
        presence.flex_basis = true;
    }
    if let Some(value) = input.flex_grow {
        style.flex_grow = number::to_f32(value);
        presence.flex_grow = true;
    }
    if let Some(value) = input.flex_shrink {
        style.flex_shrink = number::to_f32(value);
        presence.flex_shrink = true;
    }
    if let Some(value) = input.grid_template_rows {
        style.grid_template_rows = grid::template_components(value)?;
        presence.grid_template_rows = true;
    }
    if let Some(value) = input.grid_template_columns {
        style.grid_template_columns = grid::template_components(value)?;
        presence.grid_template_columns = true;
    }
    if let Some(value) = input.grid_auto_rows {
        style.grid_auto_rows = value
            .into_iter()
            .map(grid::track_sizing)
            .collect::<BindingResult<Vec<_>>>()?;
        presence.grid_auto_rows = true;
    }
    if let Some(value) = input.grid_auto_columns {
        style.grid_auto_columns = value
            .into_iter()
            .map(grid::track_sizing)
            .collect::<BindingResult<Vec<_>>>()?;
        presence.grid_auto_columns = true;
    }
    if let Some(value) = input.grid_auto_flow {
        style.grid_auto_flow = grid_auto_flow(value)?;
        presence.grid_auto_flow = true;
    }
    if let Some(value) = input.grid_template_areas {
        style.grid_template_areas = match value {
            Either::A(value) => Some(grid::template_areas(value)?),
            Either::B(_) => None,
        };
        presence.grid_template_areas = true;
    }
    if let Some(value) = input.grid_template_column_names {
        style.grid_template_column_names = value;
        presence.grid_template_column_names = true;
    }
    if let Some(value) = input.grid_template_row_names {
        style.grid_template_row_names = value;
        presence.grid_template_row_names = true;
    }
    if let Some(value) = input.grid_row {
        let (value, fields) = geometry::partial_line(value, style.grid_row, grid::grid_placement)?;
        style.grid_row = value;
        presence.grid_row = Some(fields);
    }
    if let Some(value) = input.grid_column {
        let (value, fields) =
            geometry::partial_line(value, style.grid_column, grid::grid_placement)?;
        style.grid_column = value;
        presence.grid_column = Some(fields);
    }

    Ok(StylePatch {
        value: style,
        presence,
    })
}

pub(crate) fn input(value: Unknown<'_>) -> BindingResult<Style> {
    let patch = patch(value)?;
    validate(&patch.value)?;
    Ok(patch.value)
}

pub(crate) fn apply_patch(current: &Style, patch: StylePatch) -> BindingResult<Option<Style>> {
    if !patch.changes(current) {
        return Ok(None);
    }
    let updated = patch.merge(current);
    validate(&updated)?;
    Ok(Some(updated))
}

fn display_output(value: Display) -> u8 {
    match value {
        Display::Block => DisplayCode::Block as u8,
        Display::FlowRoot => DisplayCode::FlowRoot as u8,
        Display::Flex => DisplayCode::Flex as u8,
        Display::Grid => DisplayCode::Grid as u8,
        Display::None => DisplayCode::None as u8,
    }
}

fn box_sizing_output(value: BoxSizing) -> u8 {
    match value {
        BoxSizing::BorderBox => BoxSizingCode::BorderBox as u8,
        BoxSizing::ContentBox => BoxSizingCode::ContentBox as u8,
    }
}

fn direction_output(value: Direction) -> u8 {
    match value {
        Direction::Ltr => DirectionCode::Ltr as u8,
        Direction::Rtl => DirectionCode::Rtl as u8,
    }
}

fn overflow_output(value: Overflow) -> u8 {
    match value {
        Overflow::Visible => OverflowCode::Visible as u8,
        Overflow::Clip => OverflowCode::Clip as u8,
        Overflow::Hidden => OverflowCode::Hidden as u8,
        Overflow::Scroll => OverflowCode::Scroll as u8,
    }
}

fn float_output(value: Float) -> u8 {
    match value {
        Float::Left => FloatCode::Left as u8,
        Float::Right => FloatCode::Right as u8,
        Float::None => FloatCode::None as u8,
    }
}

fn clear_output(value: Clear) -> u8 {
    match value {
        Clear::Left => ClearCode::Left as u8,
        Clear::Right => ClearCode::Right as u8,
        Clear::Both => ClearCode::Both as u8,
        Clear::None => ClearCode::None as u8,
    }
}

fn position_output(value: Position) -> u8 {
    match value {
        Position::Relative => PositionCode::Relative as u8,
        Position::Absolute => PositionCode::Absolute as u8,
    }
}

fn align_items_output(value: AlignItems) -> u8 {
    for (expected, code) in [
        (AlignItems::START, AlignItemsCode::Start),
        (AlignItems::END, AlignItemsCode::End),
        (AlignItems::FLEX_START, AlignItemsCode::FlexStart),
        (AlignItems::FLEX_END, AlignItemsCode::FlexEnd),
        (AlignItems::SELF_START, AlignItemsCode::SelfStart),
        (AlignItems::SELF_END, AlignItemsCode::SelfEnd),
        (AlignItems::CENTER, AlignItemsCode::Center),
        (AlignItems::BASELINE, AlignItemsCode::Baseline),
        (AlignItems::STRETCH, AlignItemsCode::Stretch),
        (AlignItems::SAFE_START, AlignItemsCode::SafeStart),
        (AlignItems::SAFE_END, AlignItemsCode::SafeEnd),
        (AlignItems::SAFE_FLEX_START, AlignItemsCode::SafeFlexStart),
        (AlignItems::SAFE_FLEX_END, AlignItemsCode::SafeFlexEnd),
        (AlignItems::SAFE_SELF_START, AlignItemsCode::SafeSelfStart),
        (AlignItems::SAFE_SELF_END, AlignItemsCode::SafeSelfEnd),
        (AlignItems::SAFE_CENTER, AlignItemsCode::SafeCenter),
    ] {
        if value == expected {
            return code as u8;
        }
    }
    panic!("unsupported Taffy item alignment")
}

fn align_content_output(value: AlignContent) -> u8 {
    for (expected, code) in [
        (AlignContent::START, AlignContentCode::Start),
        (AlignContent::END, AlignContentCode::End),
        (AlignContent::FLEX_START, AlignContentCode::FlexStart),
        (AlignContent::FLEX_END, AlignContentCode::FlexEnd),
        (AlignContent::CENTER, AlignContentCode::Center),
        (AlignContent::STRETCH, AlignContentCode::Stretch),
        (AlignContent::SPACE_BETWEEN, AlignContentCode::SpaceBetween),
        (AlignContent::SPACE_EVENLY, AlignContentCode::SpaceEvenly),
        (AlignContent::SPACE_AROUND, AlignContentCode::SpaceAround),
        (AlignContent::SAFE_START, AlignContentCode::SafeStart),
        (AlignContent::SAFE_END, AlignContentCode::SafeEnd),
        (
            AlignContent::SAFE_FLEX_START,
            AlignContentCode::SafeFlexStart,
        ),
        (AlignContent::SAFE_FLEX_END, AlignContentCode::SafeFlexEnd),
        (AlignContent::SAFE_CENTER, AlignContentCode::SafeCenter),
    ] {
        if value == expected {
            return code as u8;
        }
    }
    panic!("unsupported Taffy content alignment")
}

fn text_align_output(value: TextAlign) -> u8 {
    match value {
        TextAlign::Auto => TextAlignCode::Auto as u8,
        TextAlign::LegacyLeft => TextAlignCode::LegacyLeft as u8,
        TextAlign::LegacyRight => TextAlignCode::LegacyRight as u8,
        TextAlign::LegacyCenter => TextAlignCode::LegacyCenter as u8,
    }
}

fn flex_direction_output(value: FlexDirection) -> u8 {
    match value {
        FlexDirection::Row => FlexDirectionCode::Row as u8,
        FlexDirection::Column => FlexDirectionCode::Column as u8,
        FlexDirection::RowReverse => FlexDirectionCode::RowReverse as u8,
        FlexDirection::ColumnReverse => FlexDirectionCode::ColumnReverse as u8,
    }
}

fn flex_wrap_output(value: FlexWrap) -> u8 {
    match value {
        FlexWrap::NoWrap => FlexWrapCode::NoWrap as u8,
        FlexWrap::Wrap => FlexWrapCode::Wrap as u8,
        FlexWrap::WrapReverse => FlexWrapCode::WrapReverse as u8,
    }
}

fn grid_auto_flow_output(value: GridAutoFlow) -> u8 {
    match value {
        GridAutoFlow::Row => GridAutoFlowCode::Row as u8,
        GridAutoFlow::Column => GridAutoFlowCode::Column as u8,
        GridAutoFlow::RowDense => GridAutoFlowCode::RowDense as u8,
        GridAutoFlow::ColumnDense => GridAutoFlowCode::ColumnDense as u8,
    }
}

fn size_output<T>(
    value: &Size<T>,
    convert: impl Fn(&T) -> length::LengthOutput,
) -> LengthSizeOutput {
    LengthSizeOutput {
        width: convert(&value.width),
        height: convert(&value.height),
    }
}

fn rect_output<T>(
    value: &Rect<T>,
    convert: impl Fn(&T) -> length::LengthOutput,
) -> LengthRectOutput {
    LengthRectOutput {
        left: convert(&value.left),
        right: convert(&value.right),
        top: convert(&value.top),
        bottom: convert(&value.bottom),
    }
}

fn placement_line_output(
    value: &taffy::geometry::Line<taffy::GridPlacement<String>>,
) -> GridPlacementLineOutput {
    GridPlacementLineOutput {
        start: grid::placement_output(&value.start),
        end: grid::placement_output(&value.end),
    }
}

pub(crate) fn output(style: &Style) -> StyleOutput {
    StyleOutput {
        display: display_output(style.display),
        item_is_table: style.item_is_table,
        item_is_replaced: style.item_is_replaced,
        box_sizing: box_sizing_output(style.box_sizing),
        direction: direction_output(style.direction),
        overflow: OverflowOutput {
            x: overflow_output(style.overflow.x),
            y: overflow_output(style.overflow.y),
        },
        scrollbar_width: f64::from(style.scrollbar_width),
        r#float: float_output(style.float),
        clear: clear_output(style.clear),
        position: position_output(style.position),
        inset: rect_output(&style.inset, |value| {
            length::length_percentage_auto_output(*value)
        }),
        size: size_output(&style.size, |value| length::dimension_output(*value)),
        min_size: size_output(&style.min_size, |value| length::dimension_output(*value)),
        max_size: size_output(&style.max_size, |value| length::dimension_output(*value)),
        aspect_ratio: style.aspect_ratio.map(f64::from),
        margin: rect_output(&style.margin, |value| {
            length::length_percentage_auto_output(*value)
        }),
        padding: rect_output(&style.padding, |value| {
            length::length_percentage_output(*value)
        }),
        border: rect_output(&style.border, |value| {
            length::length_percentage_output(*value)
        }),
        align_items: style.align_items.map(align_items_output),
        align_self: style.align_self.map(align_items_output),
        justify_items: style.justify_items.map(align_items_output),
        justify_self: style.justify_self.map(align_items_output),
        align_content: style.align_content.map(align_content_output),
        justify_content: style.justify_content.map(align_content_output),
        gap: size_output(&style.gap, |value| length::length_percentage_output(*value)),
        text_align: text_align_output(style.text_align),
        flex_direction: flex_direction_output(style.flex_direction),
        flex_wrap: flex_wrap_output(style.flex_wrap),
        flex_basis: length::dimension_output(style.flex_basis),
        flex_grow: f64::from(style.flex_grow),
        flex_shrink: f64::from(style.flex_shrink),
        grid_template_rows: style
            .grid_template_rows
            .iter()
            .map(grid::template_component_output)
            .collect(),
        grid_template_columns: style
            .grid_template_columns
            .iter()
            .map(grid::template_component_output)
            .collect(),
        grid_auto_rows: style
            .grid_auto_rows
            .iter()
            .map(grid::track_sizing_output)
            .collect(),
        grid_auto_columns: style
            .grid_auto_columns
            .iter()
            .map(grid::track_sizing_output)
            .collect(),
        grid_auto_flow: grid_auto_flow_output(style.grid_auto_flow),
        grid_template_areas: style
            .grid_template_areas
            .as_ref()
            .map(grid::template_areas_output),
        grid_template_column_names: style.grid_template_column_names.clone(),
        grid_template_row_names: style.grid_template_row_names.clone(),
        grid_row: placement_line_output(&style.grid_row),
        grid_column: placement_line_output(&style.grid_column),
    }
}
