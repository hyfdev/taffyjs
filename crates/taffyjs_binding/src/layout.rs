use napi_derive::napi;
use taffy::Layout;

#[napi(object, object_from_js = false)]
pub struct NumberPointOutput {
    pub x: f64,
    pub y: f64,
}

#[napi(object, object_from_js = false)]
pub struct NumberSizeOutput {
    pub width: f64,
    pub height: f64,
}

#[napi(object, object_from_js = false)]
pub struct NumberRectOutput {
    pub left: f64,
    pub right: f64,
    pub top: f64,
    pub bottom: f64,
}

#[napi(object, object_from_js = false)]
pub struct LayoutOutput {
    pub order: u32,
    pub location: NumberPointOutput,
    pub size: NumberSizeOutput,
    pub content_size: NumberSizeOutput,
    pub scrollbar_size: NumberSizeOutput,
    pub border: NumberRectOutput,
    pub padding: NumberRectOutput,
    pub margin: NumberRectOutput,
}

fn point_output(value: &taffy::Point<f32>) -> NumberPointOutput {
    NumberPointOutput {
        x: f64::from(value.x),
        y: f64::from(value.y),
    }
}

fn size_output(value: &taffy::Size<f32>) -> NumberSizeOutput {
    NumberSizeOutput {
        width: f64::from(value.width),
        height: f64::from(value.height),
    }
}

fn rect_output(value: &taffy::Rect<f32>) -> NumberRectOutput {
    NumberRectOutput {
        left: f64::from(value.left),
        right: f64::from(value.right),
        top: f64::from(value.top),
        bottom: f64::from(value.bottom),
    }
}

pub(crate) fn output(value: &Layout) -> LayoutOutput {
    LayoutOutput {
        order: value.order,
        location: point_output(&value.location),
        size: size_output(&value.size),
        content_size: size_output(&value.content_size),
        scrollbar_size: size_output(&value.scrollbar_size),
        border: rect_output(&value.border),
        padding: rect_output(&value.padding),
        margin: rect_output(&value.margin),
    }
}
