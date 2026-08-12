use napi::bindgen_prelude::{FromNapiValue, Object, Unknown};
use napi::{Env, JsValue, ValueType};
use taffy::style::{
    CompactLength, GridPlacement, GridTemplateArea, GridTemplateAreas, GridTemplateComponent,
    GridTemplateRepetition, MaxTrackSizingFunction, MinTrackSizingFunction, RepetitionCount,
    TrackSizingFunction,
};

use crate::error::{NativeResult, range_error, type_error};
use crate::generated_numeric::{
    GridPlacementKindCode, GridTemplateComponentKindCode, RepetitionCountKindCode,
    TrackSizingKindCode,
};
use crate::length;
use crate::number::{to_f32, to_integer};

fn read_object<'env>(value: Unknown<'env>, name: &str) -> NativeResult<Object<'env>> {
    if value
        .get_type()
        .map_err(|_| type_error(format!("Expected a {name} object")))?
        != ValueType::Object
    {
        return Err(type_error(format!("Expected a {name} object")));
    }
    let object = unsafe {
        value
            .cast::<Object<'env>>()
            .map_err(|_| type_error(format!("Expected a {name} object")))?
    };
    if object
        .is_array()
        .map_err(|_| type_error(format!("Expected a {name} object")))?
    {
        return Err(type_error(format!("Expected a {name} object")));
    }
    Ok(object)
}

fn required<'env, T>(object: &Object<'env>, field: &str) -> NativeResult<T>
where
    T: FromNapiValue,
{
    object
        .get::<T>(field)
        .map_err(|_| type_error(format!("Could not read Grid field {field}")))?
        .ok_or_else(|| type_error(format!("Grid field {field} is required")))
}

fn kind(object: &Object<'_>) -> NativeResult<f64> {
    required(object, "kind")
}

pub(crate) fn grid_placement(value: Unknown<'_>) -> NativeResult<GridPlacement<String>> {
    let object = read_object(value, "GridPlacement")?;
    Ok(match to_integer::<GridPlacementKindCode>(kind(&object)?)? {
        GridPlacementKindCode::Auto => GridPlacement::Auto,
        GridPlacementKindCode::Line => {
            let index = to_integer::<i16>(required(&object, "index")?)?;
            GridPlacement::Line(index.into())
        }
        GridPlacementKindCode::NamedLine => GridPlacement::NamedLine(
            required(&object, "name")?,
            to_integer::<i16>(required(&object, "index")?)?,
        ),
        GridPlacementKindCode::Span => {
            GridPlacement::Span(to_integer::<u16>(required(&object, "span")?)?)
        }
        GridPlacementKindCode::NamedSpan => GridPlacement::NamedSpan(
            required(&object, "name")?,
            to_integer::<u16>(required(&object, "span")?)?,
        ),
    })
}

fn min_track(value: Unknown<'_>) -> NativeResult<MinTrackSizingFunction> {
    let object = read_object(value, "minimum track sizing")?;
    match to_integer::<TrackSizingKindCode>(kind(&object)?)? {
        TrackSizingKindCode::Length => Ok(MinTrackSizingFunction::length(to_f32(required(
            &object, "value",
        )?))),
        TrackSizingKindCode::Percent => Ok(MinTrackSizingFunction::percent(to_f32(
            required::<f64>(&object, "value")? / 100.0,
        ))),
        TrackSizingKindCode::Auto => Ok(MinTrackSizingFunction::auto()),
        TrackSizingKindCode::MinContent => Ok(MinTrackSizingFunction::min_content()),
        TrackSizingKindCode::MaxContent => Ok(MinTrackSizingFunction::max_content()),
        TrackSizingKindCode::FitContent | TrackSizingKindCode::Fr => {
            Err(type_error("This track kind is not valid for a minimum"))
        }
    }
}

fn max_track(value: Unknown<'_>) -> NativeResult<MaxTrackSizingFunction> {
    let object = read_object(value, "maximum track sizing")?;
    match to_integer::<TrackSizingKindCode>(kind(&object)?)? {
        TrackSizingKindCode::Length => Ok(MaxTrackSizingFunction::length(to_f32(required(
            &object, "value",
        )?))),
        TrackSizingKindCode::Percent => Ok(MaxTrackSizingFunction::percent(to_f32(
            required::<f64>(&object, "value")? / 100.0,
        ))),
        TrackSizingKindCode::Auto => Ok(MaxTrackSizingFunction::auto()),
        TrackSizingKindCode::MinContent => Ok(MaxTrackSizingFunction::min_content()),
        TrackSizingKindCode::MaxContent => Ok(MaxTrackSizingFunction::max_content()),
        TrackSizingKindCode::FitContent => {
            let value = length::length_percentage(required(&object, "value")?)?;
            let raw = value.into_raw();
            Ok(match raw.tag() {
                taffy::style::CompactLength::LENGTH_TAG => {
                    MaxTrackSizingFunction::fit_content_px(raw.value())
                }
                taffy::style::CompactLength::PERCENT_TAG => {
                    MaxTrackSizingFunction::fit_content_percent(raw.value())
                }
                _ => panic!("unsupported fit-content length tag"),
            })
        }
        TrackSizingKindCode::Fr => Ok(MaxTrackSizingFunction::fr(to_f32(required(
            &object, "value",
        )?))),
    }
}

pub(crate) fn track_sizing(value: Unknown<'_>) -> NativeResult<TrackSizingFunction> {
    let object = read_object(value, "TrackSizingFunction")?;
    Ok(TrackSizingFunction {
        min: min_track(required(&object, "min")?)?,
        max: max_track(required(&object, "max")?)?,
    })
}

fn repetition_count(value: Unknown<'_>) -> NativeResult<RepetitionCount> {
    let object = read_object(value, "RepetitionCount")?;
    Ok(
        match to_integer::<RepetitionCountKindCode>(kind(&object)?)? {
            RepetitionCountKindCode::Count => {
                RepetitionCount::Count(to_integer::<u16>(required(&object, "value")?)?)
            }
            RepetitionCountKindCode::AutoFill => RepetitionCount::AutoFill,
            RepetitionCountKindCode::AutoFit => RepetitionCount::AutoFit,
        },
    )
}

fn template_repetition(value: Unknown<'_>) -> NativeResult<GridTemplateRepetition<String>> {
    let object = read_object(value, "GridTemplateRepetition")?;
    let tracks = required::<Vec<Unknown<'_>>>(&object, "tracks")?
        .into_iter()
        .map(track_sizing)
        .collect::<NativeResult<Vec<_>>>()?;
    let line_names = required::<Vec<Vec<String>>>(&object, "lineNames")?;
    Ok(GridTemplateRepetition {
        count: repetition_count(required(&object, "count")?)?,
        tracks,
        line_names,
    })
}

pub(crate) fn template_component(
    value: Unknown<'_>,
) -> NativeResult<GridTemplateComponent<String>> {
    let object = read_object(value, "GridTemplateComponent")?;
    Ok(
        match to_integer::<GridTemplateComponentKindCode>(kind(&object)?)? {
            GridTemplateComponentKindCode::Single => {
                GridTemplateComponent::Single(track_sizing(required(&object, "value")?)?)
            }
            GridTemplateComponentKindCode::Repeat => {
                GridTemplateComponent::Repeat(template_repetition(required(&object, "value")?)?)
            }
        },
    )
}

pub(crate) fn template_components(
    values: Vec<Unknown<'_>>,
) -> NativeResult<Vec<GridTemplateComponent<String>>> {
    values
        .into_iter()
        .map(template_component)
        .collect::<NativeResult<Vec<_>>>()
}

pub(crate) fn validate_template_line_names(
    values: &[GridTemplateComponent<String>],
    top_level_line_names: &[Vec<String>],
) -> NativeResult<()> {
    for value in values.iter().take(top_level_line_names.len()) {
        if let GridTemplateComponent::Repeat(repetition) = value
            && repetition.line_names.is_empty()
            && repetition.count != RepetitionCount::Count(0)
        {
            return Err(range_error(
                "A positive Grid repetition requires lineNames entries",
            ));
        }
    }
    Ok(())
}

fn template_area(value: Unknown<'_>) -> NativeResult<GridTemplateArea<String>> {
    let object = read_object(value, "GridTemplateArea")?;
    Ok(GridTemplateArea {
        name: required(&object, "name")?,
        row_start: to_integer::<u16>(required(&object, "rowStart")?)?,
        row_end: to_integer::<u16>(required(&object, "rowEnd")?)?,
        column_start: to_integer::<u16>(required(&object, "columnStart")?)?,
        column_end: to_integer::<u16>(required(&object, "columnEnd")?)?,
    })
}

pub(crate) fn template_areas(value: Unknown<'_>) -> NativeResult<GridTemplateAreas<String>> {
    let object = read_object(value, "GridTemplateAreas")?;
    let areas = required::<Vec<Unknown<'_>>>(&object, "areas")?
        .into_iter()
        .map(template_area)
        .collect::<NativeResult<Vec<_>>>()?;
    Ok(GridTemplateAreas {
        areas,
        row_count: to_integer::<u16>(required(&object, "rowCount")?)?,
        column_count: to_integer::<u16>(required(&object, "columnCount")?)?,
    })
}

fn tagged_output<'env>(env: &Env, kind: u8) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("kind", kind)?;
    Ok(output)
}

pub(crate) fn placement_output<'env>(
    env: &Env,
    value: &GridPlacement<String>,
) -> napi::Result<Object<'env>> {
    match value {
        GridPlacement::Auto => tagged_output(env, GridPlacementKindCode::Auto as u8),
        GridPlacement::Line(index) => {
            let mut output = tagged_output(env, GridPlacementKindCode::Line as u8)?;
            output.set("index", index.as_i16())?;
            Ok(output)
        }
        GridPlacement::NamedLine(name, index) => {
            let mut output = tagged_output(env, GridPlacementKindCode::NamedLine as u8)?;
            output.set("name", name.as_str())?;
            output.set("index", *index)?;
            Ok(output)
        }
        GridPlacement::Span(span) => {
            let mut output = tagged_output(env, GridPlacementKindCode::Span as u8)?;
            output.set("span", *span)?;
            Ok(output)
        }
        GridPlacement::NamedSpan(name, span) => {
            let mut output = tagged_output(env, GridPlacementKindCode::NamedSpan as u8)?;
            output.set("name", name.as_str())?;
            output.set("span", *span)?;
            Ok(output)
        }
    }
}

fn min_track_output<'env>(env: &Env, value: MinTrackSizingFunction) -> napi::Result<Object<'env>> {
    let raw = value.into_raw();
    match raw.tag() {
        CompactLength::LENGTH_TAG => {
            let mut output = tagged_output(env, TrackSizingKindCode::Length as u8)?;
            output.set("value", f64::from(raw.value()))?;
            Ok(output)
        }
        CompactLength::PERCENT_TAG => {
            let mut output = tagged_output(env, TrackSizingKindCode::Percent as u8)?;
            output.set("value", f64::from(raw.value()) * 100.0)?;
            Ok(output)
        }
        CompactLength::AUTO_TAG => tagged_output(env, TrackSizingKindCode::Auto as u8),
        CompactLength::MIN_CONTENT_TAG => tagged_output(env, TrackSizingKindCode::MinContent as u8),
        CompactLength::MAX_CONTENT_TAG => tagged_output(env, TrackSizingKindCode::MaxContent as u8),
        _ => panic!("unsupported Taffy minimum track tag"),
    }
}

fn fit_content_output<'env>(env: &Env, raw: CompactLength) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    match raw.tag() {
        CompactLength::FIT_CONTENT_PX_TAG => {
            output.set(
                "unit",
                crate::generated_numeric::LengthUnitCode::Length as u8,
            )?;
            output.set("value", f64::from(raw.value()))?;
        }
        CompactLength::FIT_CONTENT_PERCENT_TAG => {
            output.set(
                "unit",
                crate::generated_numeric::LengthUnitCode::Percent as u8,
            )?;
            output.set("value", f64::from(raw.value()) * 100.0)?;
        }
        _ => panic!("unsupported Taffy fit-content tag"),
    }
    Ok(output)
}

fn max_track_output<'env>(env: &Env, value: MaxTrackSizingFunction) -> napi::Result<Object<'env>> {
    let raw = value.into_raw();
    match raw.tag() {
        CompactLength::LENGTH_TAG => {
            let mut output = tagged_output(env, TrackSizingKindCode::Length as u8)?;
            output.set("value", f64::from(raw.value()))?;
            Ok(output)
        }
        CompactLength::PERCENT_TAG => {
            let mut output = tagged_output(env, TrackSizingKindCode::Percent as u8)?;
            output.set("value", f64::from(raw.value()) * 100.0)?;
            Ok(output)
        }
        CompactLength::AUTO_TAG => tagged_output(env, TrackSizingKindCode::Auto as u8),
        CompactLength::MIN_CONTENT_TAG => tagged_output(env, TrackSizingKindCode::MinContent as u8),
        CompactLength::MAX_CONTENT_TAG => tagged_output(env, TrackSizingKindCode::MaxContent as u8),
        CompactLength::FIT_CONTENT_PX_TAG | CompactLength::FIT_CONTENT_PERCENT_TAG => {
            let mut output = tagged_output(env, TrackSizingKindCode::FitContent as u8)?;
            output.set("value", fit_content_output(env, raw)?)?;
            Ok(output)
        }
        CompactLength::FR_TAG => {
            let mut output = tagged_output(env, TrackSizingKindCode::Fr as u8)?;
            output.set("value", f64::from(raw.value()))?;
            Ok(output)
        }
        _ => panic!("unsupported Taffy maximum track tag"),
    }
}

pub(crate) fn track_sizing_output<'env>(
    env: &Env,
    value: &TrackSizingFunction,
) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("min", min_track_output(env, value.min)?)?;
    output.set("max", max_track_output(env, value.max)?)?;
    Ok(output)
}

fn repetition_count_output<'env>(env: &Env, value: RepetitionCount) -> napi::Result<Object<'env>> {
    match value {
        RepetitionCount::Count(value) => {
            let mut output = tagged_output(env, RepetitionCountKindCode::Count as u8)?;
            output.set("value", value)?;
            Ok(output)
        }
        RepetitionCount::AutoFill => tagged_output(env, RepetitionCountKindCode::AutoFill as u8),
        RepetitionCount::AutoFit => tagged_output(env, RepetitionCountKindCode::AutoFit as u8),
    }
}

fn template_repetition_output<'env>(
    env: &Env,
    value: &GridTemplateRepetition<String>,
) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("count", repetition_count_output(env, value.count)?)?;
    output.set(
        "tracks",
        value
            .tracks
            .iter()
            .map(|track| track_sizing_output(env, track))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    output.set("lineNames", value.line_names.clone())?;
    Ok(output)
}

pub(crate) fn template_component_output<'env>(
    env: &Env,
    value: &GridTemplateComponent<String>,
) -> napi::Result<Object<'env>> {
    match value {
        GridTemplateComponent::Single(value) => {
            let mut output = tagged_output(env, GridTemplateComponentKindCode::Single as u8)?;
            output.set("value", track_sizing_output(env, value)?)?;
            Ok(output)
        }
        GridTemplateComponent::Repeat(value) => {
            let mut output = tagged_output(env, GridTemplateComponentKindCode::Repeat as u8)?;
            output.set("value", template_repetition_output(env, value)?)?;
            Ok(output)
        }
    }
}

fn template_area_output<'env>(
    env: &Env,
    value: &GridTemplateArea<String>,
) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("name", value.name.as_str())?;
    output.set("rowStart", value.row_start)?;
    output.set("rowEnd", value.row_end)?;
    output.set("columnStart", value.column_start)?;
    output.set("columnEnd", value.column_end)?;
    Ok(output)
}

pub(crate) fn template_areas_output<'env>(
    env: &Env,
    value: &GridTemplateAreas<String>,
) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set(
        "areas",
        value
            .areas
            .iter()
            .map(|area| template_area_output(env, area))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    output.set("rowCount", value.row_count)?;
    output.set("columnCount", value.column_count)?;
    Ok(output)
}
