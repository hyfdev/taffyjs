use napi::bindgen_prelude::{FromNapiValue, Object, Unknown};
use napi::{Env, JsValue, ValueType};
use taffy::geometry::{Rect, Size};
use taffy::style::{
    AlignContent, AlignItems, BoxSizing, Clear, Direction, Display, FlexDirection, FlexWrap, Float,
    GridAutoFlow, Overflow, Position, Style, TextAlign,
};

use crate::error::{NativeResult, type_error};
use crate::generated_numeric::{
    AlignContentCode, AlignItemsCode, BoxSizingCode, ClearCode, DirectionCode, DisplayCode,
    FlexDirectionCode, FlexWrapCode, FloatCode, GridAutoFlowCode, OverflowCode, PositionCode,
    TextAlignCode,
};
use crate::{geometry, grid, length, number};

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

struct StyleObject<'env>(Object<'env>);

impl<'env> StyleObject<'env> {
    fn read(value: Unknown<'env>) -> NativeResult<Self> {
        if value
            .get_type()
            .map_err(|_| type_error("Expected a Style object"))?
            != ValueType::Object
        {
            return Err(type_error("Expected a Style object"));
        }
        let object = unsafe {
            value
                .cast::<Object<'env>>()
                .map_err(|_| type_error("Expected a Style object"))?
        };
        if object
            .is_array()
            .map_err(|_| type_error("Expected a Style object"))?
        {
            return Err(type_error("Expected a Style object"));
        }
        let keys = Object::keys(&object).map_err(|_| type_error("Could not read Style keys"))?;
        if keys.iter().any(|key| !STYLE_FIELDS.contains(&key.as_str())) {
            return Err(type_error("Style object contains an unknown field"));
        }
        Ok(Self(object))
    }

    fn get(&self, field: &str) -> NativeResult<Option<Unknown<'env>>> {
        self.0
            .get(field)
            .map_err(|_| type_error(format!("Could not read Style field {field}")))
    }
}

fn cast<'env, T: FromNapiValue>(value: Unknown<'env>, name: &str) -> NativeResult<T> {
    unsafe {
        value
            .cast::<T>()
            .map_err(|_| type_error(format!("{name} has the wrong type")))
    }
}

fn number(value: Unknown<'_>, name: &str) -> NativeResult<f64> {
    cast(value, name)
}

fn integer<T>(value: Unknown<'_>, name: &str) -> NativeResult<T>
where
    T: TryFrom<i64>,
{
    number::to_integer(number(value, name)?)
}

fn is_null(value: Unknown<'_>) -> NativeResult<bool> {
    value
        .get_type()
        .map(|kind| kind == ValueType::Null)
        .map_err(|_| type_error("Could not inspect a Style field"))
}

fn is_tagged_length(value: Unknown<'_>) -> NativeResult<bool> {
    if value
        .get_type()
        .map_err(|_| type_error("Expected a length or geometry object"))?
        != ValueType::Object
    {
        return Ok(false);
    }
    let object = unsafe {
        value
            .cast::<Object<'_>>()
            .map_err(|_| type_error("Expected a length or geometry object"))?
    };
    object
        .get::<Unknown<'_>>("unit")
        .map(|unit| unit.is_some())
        .map_err(|_| type_error("Could not read length unit"))
}

fn dimension_size(
    value: Unknown<'_>,
    default: Size<taffy::Dimension>,
) -> NativeResult<Size<taffy::Dimension>> {
    if is_tagged_length(value)? {
        let value = length::dimension(value)?;
        Ok(Size {
            width: value,
            height: value,
        })
    } else {
        geometry::partial_size(value, default, length::dimension)
    }
}

fn auto_rect(
    value: Unknown<'_>,
    default: Rect<taffy::LengthPercentageAuto>,
) -> NativeResult<Rect<taffy::LengthPercentageAuto>> {
    if is_tagged_length(value)? {
        let value = length::length_percentage_auto(value)?;
        Ok(Rect {
            left: value,
            right: value,
            top: value,
            bottom: value,
        })
    } else {
        geometry::partial_rect(value, default, length::length_percentage_auto)
    }
}

fn length_rect(
    value: Unknown<'_>,
    default: Rect<taffy::LengthPercentage>,
) -> NativeResult<Rect<taffy::LengthPercentage>> {
    if is_tagged_length(value)? {
        let value = length::length_percentage(value)?;
        Ok(Rect {
            left: value,
            right: value,
            top: value,
            bottom: value,
        })
    } else {
        geometry::partial_rect(value, default, length::length_percentage)
    }
}

fn length_size(
    value: Unknown<'_>,
    default: Size<taffy::LengthPercentage>,
) -> NativeResult<Size<taffy::LengthPercentage>> {
    if is_tagged_length(value)? {
        let value = length::length_percentage(value)?;
        Ok(Size {
            width: value,
            height: value,
        })
    } else {
        geometry::partial_size(value, default, length::length_percentage)
    }
}

fn display(value: Unknown<'_>) -> NativeResult<Display> {
    Ok(match integer::<DisplayCode>(value, "display")? {
        DisplayCode::Block => Display::Block,
        DisplayCode::FlowRoot => Display::FlowRoot,
        DisplayCode::Flex => Display::Flex,
        DisplayCode::Grid => Display::Grid,
        DisplayCode::None => Display::None,
    })
}

fn box_sizing(value: Unknown<'_>) -> NativeResult<BoxSizing> {
    Ok(match integer::<BoxSizingCode>(value, "boxSizing")? {
        BoxSizingCode::BorderBox => BoxSizing::BorderBox,
        BoxSizingCode::ContentBox => BoxSizing::ContentBox,
    })
}

fn direction(value: Unknown<'_>) -> NativeResult<Direction> {
    Ok(match integer::<DirectionCode>(value, "direction")? {
        DirectionCode::Ltr => Direction::Ltr,
        DirectionCode::Rtl => Direction::Rtl,
    })
}

fn overflow(value: Unknown<'_>) -> NativeResult<Overflow> {
    Ok(match integer::<OverflowCode>(value, "overflow")? {
        OverflowCode::Visible => Overflow::Visible,
        OverflowCode::Clip => Overflow::Clip,
        OverflowCode::Hidden => Overflow::Hidden,
        OverflowCode::Scroll => Overflow::Scroll,
    })
}

fn float(value: Unknown<'_>) -> NativeResult<Float> {
    Ok(match integer::<FloatCode>(value, "float")? {
        FloatCode::Left => Float::Left,
        FloatCode::Right => Float::Right,
        FloatCode::None => Float::None,
    })
}

fn clear(value: Unknown<'_>) -> NativeResult<Clear> {
    Ok(match integer::<ClearCode>(value, "clear")? {
        ClearCode::Left => Clear::Left,
        ClearCode::Right => Clear::Right,
        ClearCode::Both => Clear::Both,
        ClearCode::None => Clear::None,
    })
}

fn position(value: Unknown<'_>) -> NativeResult<Position> {
    Ok(match integer::<PositionCode>(value, "position")? {
        PositionCode::Relative => Position::Relative,
        PositionCode::Absolute => Position::Absolute,
    })
}

fn align_items(value: Unknown<'_>) -> NativeResult<AlignItems> {
    Ok(match integer::<AlignItemsCode>(value, "alignment")? {
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

fn align_content(value: Unknown<'_>) -> NativeResult<AlignContent> {
    Ok(
        match integer::<AlignContentCode>(value, "content alignment")? {
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
        },
    )
}

fn text_align(value: Unknown<'_>) -> NativeResult<TextAlign> {
    Ok(match integer::<TextAlignCode>(value, "textAlign")? {
        TextAlignCode::Auto => TextAlign::Auto,
        TextAlignCode::LegacyLeft => TextAlign::LegacyLeft,
        TextAlignCode::LegacyRight => TextAlign::LegacyRight,
        TextAlignCode::LegacyCenter => TextAlign::LegacyCenter,
    })
}

fn flex_direction(value: Unknown<'_>) -> NativeResult<FlexDirection> {
    Ok(
        match integer::<FlexDirectionCode>(value, "flexDirection")? {
            FlexDirectionCode::Row => FlexDirection::Row,
            FlexDirectionCode::Column => FlexDirection::Column,
            FlexDirectionCode::RowReverse => FlexDirection::RowReverse,
            FlexDirectionCode::ColumnReverse => FlexDirection::ColumnReverse,
        },
    )
}

fn flex_wrap(value: Unknown<'_>) -> NativeResult<FlexWrap> {
    Ok(match integer::<FlexWrapCode>(value, "flexWrap")? {
        FlexWrapCode::NoWrap => FlexWrap::NoWrap,
        FlexWrapCode::Wrap => FlexWrap::Wrap,
        FlexWrapCode::WrapReverse => FlexWrap::WrapReverse,
    })
}

fn grid_auto_flow(value: Unknown<'_>) -> NativeResult<GridAutoFlow> {
    Ok(match integer::<GridAutoFlowCode>(value, "gridAutoFlow")? {
        GridAutoFlowCode::Row => GridAutoFlow::Row,
        GridAutoFlowCode::Column => GridAutoFlow::Column,
        GridAutoFlowCode::RowDense => GridAutoFlow::RowDense,
        GridAutoFlowCode::ColumnDense => GridAutoFlow::ColumnDense,
    })
}

pub(crate) fn input(value: Unknown<'_>) -> NativeResult<Style> {
    let object = StyleObject::read(value)?;
    let mut style = Style::default();

    if let Some(value) = object.get("display")? {
        style.display = display(value)?;
    }
    if let Some(value) = object.get("itemIsTable")? {
        style.item_is_table = cast(value, "itemIsTable")?;
    }
    if let Some(value) = object.get("itemIsReplaced")? {
        style.item_is_replaced = cast(value, "itemIsReplaced")?;
    }
    if let Some(value) = object.get("boxSizing")? {
        style.box_sizing = box_sizing(value)?;
    }
    if let Some(value) = object.get("direction")? {
        style.direction = direction(value)?;
    }
    if let Some(value) = object.get("overflow")? {
        style.overflow = geometry::partial_point(value, style.overflow, overflow)?;
    }
    if let Some(value) = object.get("scrollbarWidth")? {
        style.scrollbar_width = number::to_f32(number(value, "scrollbarWidth")?);
    }
    if let Some(value) = object.get("float")? {
        style.float = float(value)?;
    }
    if let Some(value) = object.get("clear")? {
        style.clear = clear(value)?;
    }
    if let Some(value) = object.get("position")? {
        style.position = position(value)?;
    }
    if let Some(value) = object.get("inset")? {
        style.inset = auto_rect(value, style.inset)?;
    }
    if let Some(value) = object.get("size")? {
        style.size = dimension_size(value, style.size)?;
    }
    if let Some(value) = object.get("minSize")? {
        style.min_size = dimension_size(value, style.min_size)?;
    }
    if let Some(value) = object.get("maxSize")? {
        style.max_size = dimension_size(value, style.max_size)?;
    }
    if let Some(value) = object.get("aspectRatio")? {
        style.aspect_ratio = if is_null(value)? {
            None
        } else {
            Some(number::to_f32(number(value, "aspectRatio")?))
        };
    }
    if let Some(value) = object.get("margin")? {
        style.margin = auto_rect(value, style.margin)?;
    }
    if let Some(value) = object.get("padding")? {
        style.padding = length_rect(value, style.padding)?;
    }
    if let Some(value) = object.get("border")? {
        style.border = length_rect(value, style.border)?;
    }
    if let Some(value) = object.get("alignItems")? {
        style.align_items = if is_null(value)? {
            None
        } else {
            Some(align_items(value)?)
        };
    }
    if let Some(value) = object.get("alignSelf")? {
        style.align_self = if is_null(value)? {
            None
        } else {
            Some(align_items(value)?)
        };
    }
    if let Some(value) = object.get("justifyItems")? {
        style.justify_items = if is_null(value)? {
            None
        } else {
            Some(align_items(value)?)
        };
    }
    if let Some(value) = object.get("justifySelf")? {
        style.justify_self = if is_null(value)? {
            None
        } else {
            Some(align_items(value)?)
        };
    }
    if let Some(value) = object.get("alignContent")? {
        style.align_content = if is_null(value)? {
            None
        } else {
            Some(align_content(value)?)
        };
    }
    if let Some(value) = object.get("justifyContent")? {
        style.justify_content = if is_null(value)? {
            None
        } else {
            Some(align_content(value)?)
        };
    }
    if let Some(value) = object.get("gap")? {
        style.gap = length_size(value, style.gap)?;
    }
    if let Some(value) = object.get("textAlign")? {
        style.text_align = text_align(value)?;
    }
    if let Some(value) = object.get("flexDirection")? {
        style.flex_direction = flex_direction(value)?;
    }
    if let Some(value) = object.get("flexWrap")? {
        style.flex_wrap = flex_wrap(value)?;
    }
    if let Some(value) = object.get("flexBasis")? {
        style.flex_basis = length::dimension(value)?;
    }
    if let Some(value) = object.get("flexGrow")? {
        style.flex_grow = number::to_f32(number(value, "flexGrow")?);
    }
    if let Some(value) = object.get("flexShrink")? {
        style.flex_shrink = number::to_f32(number(value, "flexShrink")?);
    }
    if let Some(value) = object.get("gridTemplateRows")? {
        style.grid_template_rows = grid::template_components(cast(value, "gridTemplateRows")?)?;
    }
    if let Some(value) = object.get("gridTemplateColumns")? {
        style.grid_template_columns =
            grid::template_components(cast(value, "gridTemplateColumns")?)?;
    }
    if let Some(value) = object.get("gridAutoRows")? {
        style.grid_auto_rows = cast::<Vec<Unknown<'_>>>(value, "gridAutoRows")?
            .into_iter()
            .map(grid::track_sizing)
            .collect::<NativeResult<Vec<_>>>()?;
    }
    if let Some(value) = object.get("gridAutoColumns")? {
        style.grid_auto_columns = cast::<Vec<Unknown<'_>>>(value, "gridAutoColumns")?
            .into_iter()
            .map(grid::track_sizing)
            .collect::<NativeResult<Vec<_>>>()?;
    }
    if let Some(value) = object.get("gridAutoFlow")? {
        style.grid_auto_flow = grid_auto_flow(value)?;
    }
    if let Some(value) = object.get("gridTemplateAreas")? {
        style.grid_template_areas = if is_null(value)? {
            None
        } else {
            Some(grid::template_areas(value)?)
        };
    }
    if let Some(value) = object.get("gridTemplateColumnNames")? {
        style.grid_template_column_names = cast(value, "gridTemplateColumnNames")?;
    }
    if let Some(value) = object.get("gridTemplateRowNames")? {
        style.grid_template_row_names = cast(value, "gridTemplateRowNames")?;
    }
    grid::validate_template_line_names(&style.grid_template_rows, &style.grid_template_row_names)?;
    grid::validate_template_line_names(
        &style.grid_template_columns,
        &style.grid_template_column_names,
    )?;
    if let Some(value) = object.get("gridRow")? {
        style.grid_row = geometry::partial_line(value, style.grid_row, grid::grid_placement)?;
    }
    if let Some(value) = object.get("gridColumn")? {
        style.grid_column = geometry::partial_line(value, style.grid_column, grid::grid_placement)?;
    }

    Ok(style)
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

pub(crate) fn output<'env>(env: &Env, style: &Style) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("display", display_output(style.display))?;
    output.set("itemIsTable", style.item_is_table)?;
    output.set("itemIsReplaced", style.item_is_replaced)?;
    output.set("boxSizing", box_sizing_output(style.box_sizing))?;
    output.set("direction", direction_output(style.direction))?;
    output.set(
        "overflow",
        geometry::point_output(env, &style.overflow, |value| Ok(overflow_output(*value)))?,
    )?;
    output.set("scrollbarWidth", f64::from(style.scrollbar_width))?;
    output.set("float", float_output(style.float))?;
    output.set("clear", clear_output(style.clear))?;
    output.set("position", position_output(style.position))?;
    output.set(
        "inset",
        geometry::rect_output(env, &style.inset, |value| {
            length::length_percentage_auto_object(env, *value)
        })?,
    )?;
    output.set(
        "size",
        geometry::size_output(env, &style.size, |value| {
            length::dimension_object(env, *value)
        })?,
    )?;
    output.set(
        "minSize",
        geometry::size_output(env, &style.min_size, |value| {
            length::dimension_object(env, *value)
        })?,
    )?;
    output.set(
        "maxSize",
        geometry::size_output(env, &style.max_size, |value| {
            length::dimension_object(env, *value)
        })?,
    )?;
    output.set("aspectRatio", style.aspect_ratio.map(f64::from))?;
    output.set(
        "margin",
        geometry::rect_output(env, &style.margin, |value| {
            length::length_percentage_auto_object(env, *value)
        })?,
    )?;
    output.set(
        "padding",
        geometry::rect_output(env, &style.padding, |value| {
            length::length_percentage_object(env, *value)
        })?,
    )?;
    output.set(
        "border",
        geometry::rect_output(env, &style.border, |value| {
            length::length_percentage_object(env, *value)
        })?,
    )?;
    output.set("alignItems", style.align_items.map(align_items_output))?;
    output.set("alignSelf", style.align_self.map(align_items_output))?;
    output.set("justifyItems", style.justify_items.map(align_items_output))?;
    output.set("justifySelf", style.justify_self.map(align_items_output))?;
    output.set(
        "alignContent",
        style.align_content.map(align_content_output),
    )?;
    output.set(
        "justifyContent",
        style.justify_content.map(align_content_output),
    )?;
    output.set(
        "gap",
        geometry::size_output(env, &style.gap, |value| {
            length::length_percentage_object(env, *value)
        })?,
    )?;
    output.set("textAlign", text_align_output(style.text_align))?;
    output.set("flexDirection", flex_direction_output(style.flex_direction))?;
    output.set("flexWrap", flex_wrap_output(style.flex_wrap))?;
    output.set(
        "flexBasis",
        length::dimension_object(env, style.flex_basis)?,
    )?;
    output.set("flexGrow", f64::from(style.flex_grow))?;
    output.set("flexShrink", f64::from(style.flex_shrink))?;
    output.set(
        "gridTemplateRows",
        style
            .grid_template_rows
            .iter()
            .map(|value| grid::template_component_output(env, value))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    output.set(
        "gridTemplateColumns",
        style
            .grid_template_columns
            .iter()
            .map(|value| grid::template_component_output(env, value))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    output.set(
        "gridAutoRows",
        style
            .grid_auto_rows
            .iter()
            .map(|value| grid::track_sizing_output(env, value))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    output.set(
        "gridAutoColumns",
        style
            .grid_auto_columns
            .iter()
            .map(|value| grid::track_sizing_output(env, value))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    output.set("gridAutoFlow", grid_auto_flow_output(style.grid_auto_flow))?;
    output.set(
        "gridTemplateAreas",
        style
            .grid_template_areas
            .as_ref()
            .map(|value| grid::template_areas_output(env, value))
            .transpose()?,
    )?;
    output.set(
        "gridTemplateColumnNames",
        style.grid_template_column_names.clone(),
    )?;
    output.set(
        "gridTemplateRowNames",
        style.grid_template_row_names.clone(),
    )?;
    output.set(
        "gridRow",
        geometry::line_output(env, &style.grid_row, |value| {
            grid::placement_output(env, value)
        })?,
    )?;
    output.set(
        "gridColumn",
        geometry::line_output(env, &style.grid_column, |value| {
            grid::placement_output(env, value)
        })?,
    )?;
    Ok(output)
}
