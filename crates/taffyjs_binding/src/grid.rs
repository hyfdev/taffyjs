use napi::bindgen_prelude::{Either, Unknown};
use napi_derive::napi;
use taffy::style::{
    CompactLength, GridPlacement, GridTemplateArea, GridTemplateAreas, GridTemplateComponent,
    GridTemplateRepetition, MaxTrackSizingFunction, MinTrackSizingFunction, RepetitionCount,
    TrackSizingFunction,
};

use crate::error::{NativeResult, range_error, type_error};
use crate::js_object;
use crate::length::{self, LengthOutput};
use crate::number::{from_unknown, to_f32, to_integer};
use crate::numeric::{
    GridPlacementKindCode, GridTemplateComponentKindCode, RepetitionCountKindCode,
    TrackSizingKindCode,
};

#[napi(object, object_to_js = false)]
pub struct TaggedGridInput<'env> {
    pub kind: f64,
    pub value: Option<Unknown<'env>>,
}

#[napi(object, object_to_js = false)]
pub struct GridPlacementInput<'env> {
    pub kind: f64,
    pub name: Option<Unknown<'env>>,
    pub index: Option<Unknown<'env>>,
    pub span: Option<Unknown<'env>>,
}

#[napi(object, object_to_js = false)]
pub struct TrackSizingInput<'env> {
    pub min: Unknown<'env>,
    pub max: Unknown<'env>,
}

#[napi(object, object_to_js = false)]
pub struct GridTemplateRepetitionInput<'env> {
    pub count: Unknown<'env>,
    pub tracks: Vec<Unknown<'env>>,
    pub line_names: Vec<Vec<String>>,
}

#[napi(object, object_to_js = false)]
pub struct GridTemplateAreaInput {
    pub name: String,
    pub row_start: f64,
    pub row_end: f64,
    pub column_start: f64,
    pub column_end: f64,
}

#[napi(object, object_to_js = false)]
pub struct GridTemplateAreasInput<'env> {
    pub areas: Vec<Unknown<'env>>,
    pub row_count: f64,
    pub column_count: f64,
}

#[napi(object, object_from_js = false)]
pub struct GridPlacementOutput {
    pub kind: u8,
    pub name: Option<String>,
    pub index: Option<i16>,
    pub span: Option<u16>,
}

#[napi(object, object_from_js = false)]
pub struct TrackSizingValueOutput {
    pub kind: u8,
    pub value: Option<Either<f64, LengthOutput>>,
}

#[napi(object, object_from_js = false)]
pub struct TrackSizingOutput {
    pub min: TrackSizingValueOutput,
    pub max: TrackSizingValueOutput,
}

#[napi(object, object_from_js = false)]
pub struct RepetitionCountOutput {
    pub kind: u8,
    pub value: Option<u16>,
}

#[napi(object, object_from_js = false)]
pub struct GridTemplateRepetitionOutput {
    pub count: RepetitionCountOutput,
    pub tracks: Vec<TrackSizingOutput>,
    pub line_names: Vec<Vec<String>>,
}

#[napi(object, object_from_js = false)]
pub struct GridTemplateComponentOutput {
    pub kind: u8,
    pub value: Either<TrackSizingOutput, GridTemplateRepetitionOutput>,
}

#[napi(object, object_from_js = false)]
pub struct GridTemplateAreaOutput {
    pub name: String,
    pub row_start: u16,
    pub row_end: u16,
    pub column_start: u16,
    pub column_end: u16,
}

#[napi(object, object_from_js = false)]
pub struct GridTemplateAreasOutput {
    pub areas: Vec<GridTemplateAreaOutput>,
    pub row_count: u16,
    pub column_count: u16,
}

fn tagged_input<'env>(value: Unknown<'env>, name: &str) -> NativeResult<TaggedGridInput<'env>> {
    js_object::input(value, name, None)
}

fn tagged_kind<T>(input: &TaggedGridInput<'_>) -> NativeResult<T>
where
    T: TryFrom<i64>,
{
    to_integer(input.kind)
}

fn tagged_value<'env>(input: &TaggedGridInput<'env>, name: &str) -> NativeResult<Unknown<'env>> {
    js_object::required(input.value, name)
}

fn string(value: Unknown<'_>, name: &str) -> NativeResult<String> {
    unsafe {
        value
            .cast::<String>()
            .map_err(|_| type_error(format!("{name} must be a string")))
    }
}

pub(crate) fn grid_placement(value: Unknown<'_>) -> NativeResult<GridPlacement<String>> {
    let input: GridPlacementInput<'_> = js_object::input(value, "a GridPlacement object", None)?;
    Ok(match to_integer::<GridPlacementKindCode>(input.kind)? {
        GridPlacementKindCode::Auto => GridPlacement::Auto,
        GridPlacementKindCode::Line => GridPlacement::Line(
            to_integer::<i16>(from_unknown(
                js_object::required(input.index, "Grid line index")?,
                "Grid line index",
            )?)?
            .into(),
        ),
        GridPlacementKindCode::NamedLine => GridPlacement::NamedLine(
            string(
                js_object::required(input.name, "Grid line name")?,
                "Grid line name",
            )?,
            to_integer::<i16>(from_unknown(
                js_object::required(input.index, "Grid line index")?,
                "Grid line index",
            )?)?,
        ),
        GridPlacementKindCode::Span => GridPlacement::Span(to_integer::<u16>(from_unknown(
            js_object::required(input.span, "Grid span")?,
            "Grid span",
        )?)?),
        GridPlacementKindCode::NamedSpan => GridPlacement::NamedSpan(
            string(
                js_object::required(input.name, "Grid span name")?,
                "Grid span name",
            )?,
            to_integer::<u16>(from_unknown(
                js_object::required(input.span, "Grid span")?,
                "Grid span",
            )?)?,
        ),
    })
}

fn min_track(value: Unknown<'_>) -> NativeResult<MinTrackSizingFunction> {
    let input = tagged_input(value, "a minimum track object")?;
    match tagged_kind::<TrackSizingKindCode>(&input)? {
        TrackSizingKindCode::Length => Ok(MinTrackSizingFunction::length(to_f32(from_unknown(
            tagged_value(&input, "Track value")?,
            "Track value",
        )?))),
        TrackSizingKindCode::Percent => Ok(MinTrackSizingFunction::percent(to_f32(
            from_unknown(tagged_value(&input, "Track value")?, "Track value")? / 100.0,
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
    let input = tagged_input(value, "a maximum track object")?;
    match tagged_kind::<TrackSizingKindCode>(&input)? {
        TrackSizingKindCode::Length => Ok(MaxTrackSizingFunction::length(to_f32(from_unknown(
            tagged_value(&input, "Track value")?,
            "Track value",
        )?))),
        TrackSizingKindCode::Percent => Ok(MaxTrackSizingFunction::percent(to_f32(
            from_unknown(tagged_value(&input, "Track value")?, "Track value")? / 100.0,
        ))),
        TrackSizingKindCode::Auto => Ok(MaxTrackSizingFunction::auto()),
        TrackSizingKindCode::MinContent => Ok(MaxTrackSizingFunction::min_content()),
        TrackSizingKindCode::MaxContent => Ok(MaxTrackSizingFunction::max_content()),
        TrackSizingKindCode::FitContent => {
            let value = length::length_percentage(tagged_value(&input, "Track value")?)?;
            let raw = value.into_raw();
            Ok(match raw.tag() {
                CompactLength::LENGTH_TAG => MaxTrackSizingFunction::fit_content_px(raw.value()),
                CompactLength::PERCENT_TAG => {
                    MaxTrackSizingFunction::fit_content_percent(raw.value())
                }
                _ => panic!("unsupported fit-content length tag"),
            })
        }
        TrackSizingKindCode::Fr => Ok(MaxTrackSizingFunction::fr(to_f32(from_unknown(
            tagged_value(&input, "Track value")?,
            "Track value",
        )?))),
    }
}

pub(crate) fn track_sizing(value: Unknown<'_>) -> NativeResult<TrackSizingFunction> {
    let input: TrackSizingInput<'_> =
        js_object::input(value, "a TrackSizingFunction object", None)?;
    Ok(TrackSizingFunction {
        min: min_track(input.min)?,
        max: max_track(input.max)?,
    })
}

fn repetition_count(value: Unknown<'_>) -> NativeResult<RepetitionCount> {
    let input = tagged_input(value, "a RepetitionCount object")?;
    Ok(match tagged_kind::<RepetitionCountKindCode>(&input)? {
        RepetitionCountKindCode::Count => RepetitionCount::Count(to_integer::<u16>(from_unknown(
            tagged_value(&input, "Repetition count")?,
            "Repetition count",
        )?)?),
        RepetitionCountKindCode::AutoFill => RepetitionCount::AutoFill,
        RepetitionCountKindCode::AutoFit => RepetitionCount::AutoFit,
    })
}

fn template_repetition(value: Unknown<'_>) -> NativeResult<GridTemplateRepetition<String>> {
    let input: GridTemplateRepetitionInput<'_> =
        js_object::input(value, "a GridTemplateRepetition object", None)?;
    Ok(GridTemplateRepetition {
        count: repetition_count(input.count)?,
        tracks: input
            .tracks
            .into_iter()
            .map(track_sizing)
            .collect::<NativeResult<Vec<_>>>()?,
        line_names: input.line_names,
    })
}

pub(crate) fn template_component(
    value: Unknown<'_>,
) -> NativeResult<GridTemplateComponent<String>> {
    let input = tagged_input(value, "a GridTemplateComponent object")?;
    Ok(
        match tagged_kind::<GridTemplateComponentKindCode>(&input)? {
            GridTemplateComponentKindCode::Single => {
                GridTemplateComponent::Single(track_sizing(tagged_value(&input, "Grid value")?)?)
            }
            GridTemplateComponentKindCode::Repeat => GridTemplateComponent::Repeat(
                template_repetition(tagged_value(&input, "Grid value")?)?,
            ),
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
    let input: GridTemplateAreaInput = js_object::input(value, "a GridTemplateArea object", None)?;
    Ok(GridTemplateArea {
        name: input.name,
        row_start: to_integer::<u16>(input.row_start)?,
        row_end: to_integer::<u16>(input.row_end)?,
        column_start: to_integer::<u16>(input.column_start)?,
        column_end: to_integer::<u16>(input.column_end)?,
    })
}

pub(crate) fn template_areas(value: Unknown<'_>) -> NativeResult<GridTemplateAreas<String>> {
    let input: GridTemplateAreasInput<'_> =
        js_object::input(value, "a GridTemplateAreas object", None)?;
    Ok(GridTemplateAreas {
        areas: input
            .areas
            .into_iter()
            .map(template_area)
            .collect::<NativeResult<Vec<_>>>()?,
        row_count: to_integer::<u16>(input.row_count)?,
        column_count: to_integer::<u16>(input.column_count)?,
    })
}

fn placement_output_parts(
    kind: GridPlacementKindCode,
    name: Option<String>,
    index: Option<i16>,
    span: Option<u16>,
) -> GridPlacementOutput {
    GridPlacementOutput {
        kind: kind as u8,
        name,
        index,
        span,
    }
}

pub(crate) fn placement_output(value: &GridPlacement<String>) -> GridPlacementOutput {
    match value {
        GridPlacement::Auto => {
            placement_output_parts(GridPlacementKindCode::Auto, None, None, None)
        }
        GridPlacement::Line(index) => placement_output_parts(
            GridPlacementKindCode::Line,
            None,
            Some(index.as_i16()),
            None,
        ),
        GridPlacement::NamedLine(name, index) => placement_output_parts(
            GridPlacementKindCode::NamedLine,
            Some(name.clone()),
            Some(*index),
            None,
        ),
        GridPlacement::Span(span) => {
            placement_output_parts(GridPlacementKindCode::Span, None, None, Some(*span))
        }
        GridPlacement::NamedSpan(name, span) => placement_output_parts(
            GridPlacementKindCode::NamedSpan,
            Some(name.clone()),
            None,
            Some(*span),
        ),
    }
}

fn empty_track_output(kind: TrackSizingKindCode) -> TrackSizingValueOutput {
    TrackSizingValueOutput {
        kind: kind as u8,
        value: None,
    }
}

fn numeric_track_output(kind: TrackSizingKindCode, value: f64) -> TrackSizingValueOutput {
    TrackSizingValueOutput {
        kind: kind as u8,
        value: Some(Either::A(value)),
    }
}

fn min_track_output(value: MinTrackSizingFunction) -> TrackSizingValueOutput {
    let raw = value.into_raw();
    match raw.tag() {
        CompactLength::LENGTH_TAG => {
            numeric_track_output(TrackSizingKindCode::Length, f64::from(raw.value()))
        }
        CompactLength::PERCENT_TAG => {
            numeric_track_output(TrackSizingKindCode::Percent, f64::from(raw.value()) * 100.0)
        }
        CompactLength::AUTO_TAG => empty_track_output(TrackSizingKindCode::Auto),
        CompactLength::MIN_CONTENT_TAG => empty_track_output(TrackSizingKindCode::MinContent),
        CompactLength::MAX_CONTENT_TAG => empty_track_output(TrackSizingKindCode::MaxContent),
        _ => panic!("unsupported Taffy minimum track tag"),
    }
}

fn fit_content_output(raw: CompactLength) -> LengthOutput {
    match raw.tag() {
        CompactLength::FIT_CONTENT_PX_TAG => LengthOutput {
            unit: crate::numeric::LengthUnitCode::Length as u8,
            value: Some(f64::from(raw.value())),
        },
        CompactLength::FIT_CONTENT_PERCENT_TAG => LengthOutput {
            unit: crate::numeric::LengthUnitCode::Percent as u8,
            value: Some(f64::from(raw.value()) * 100.0),
        },
        _ => panic!("unsupported Taffy fit-content tag"),
    }
}

fn max_track_output(value: MaxTrackSizingFunction) -> TrackSizingValueOutput {
    let raw = value.into_raw();
    match raw.tag() {
        CompactLength::LENGTH_TAG => {
            numeric_track_output(TrackSizingKindCode::Length, f64::from(raw.value()))
        }
        CompactLength::PERCENT_TAG => {
            numeric_track_output(TrackSizingKindCode::Percent, f64::from(raw.value()) * 100.0)
        }
        CompactLength::AUTO_TAG => empty_track_output(TrackSizingKindCode::Auto),
        CompactLength::MIN_CONTENT_TAG => empty_track_output(TrackSizingKindCode::MinContent),
        CompactLength::MAX_CONTENT_TAG => empty_track_output(TrackSizingKindCode::MaxContent),
        CompactLength::FIT_CONTENT_PX_TAG | CompactLength::FIT_CONTENT_PERCENT_TAG => {
            TrackSizingValueOutput {
                kind: TrackSizingKindCode::FitContent as u8,
                value: Some(Either::B(fit_content_output(raw))),
            }
        }
        CompactLength::FR_TAG => {
            numeric_track_output(TrackSizingKindCode::Fr, f64::from(raw.value()))
        }
        _ => panic!("unsupported Taffy maximum track tag"),
    }
}

pub(crate) fn track_sizing_output(value: &TrackSizingFunction) -> TrackSizingOutput {
    TrackSizingOutput {
        min: min_track_output(value.min),
        max: max_track_output(value.max),
    }
}

fn repetition_count_output(value: RepetitionCount) -> RepetitionCountOutput {
    match value {
        RepetitionCount::Count(value) => RepetitionCountOutput {
            kind: RepetitionCountKindCode::Count as u8,
            value: Some(value),
        },
        RepetitionCount::AutoFill => RepetitionCountOutput {
            kind: RepetitionCountKindCode::AutoFill as u8,
            value: None,
        },
        RepetitionCount::AutoFit => RepetitionCountOutput {
            kind: RepetitionCountKindCode::AutoFit as u8,
            value: None,
        },
    }
}

fn template_repetition_output(
    value: &GridTemplateRepetition<String>,
) -> GridTemplateRepetitionOutput {
    GridTemplateRepetitionOutput {
        count: repetition_count_output(value.count),
        tracks: value.tracks.iter().map(track_sizing_output).collect(),
        line_names: value.line_names.clone(),
    }
}

pub(crate) fn template_component_output(
    value: &GridTemplateComponent<String>,
) -> GridTemplateComponentOutput {
    match value {
        GridTemplateComponent::Single(value) => GridTemplateComponentOutput {
            kind: GridTemplateComponentKindCode::Single as u8,
            value: Either::A(track_sizing_output(value)),
        },
        GridTemplateComponent::Repeat(value) => GridTemplateComponentOutput {
            kind: GridTemplateComponentKindCode::Repeat as u8,
            value: Either::B(template_repetition_output(value)),
        },
    }
}

fn template_area_output(value: &GridTemplateArea<String>) -> GridTemplateAreaOutput {
    GridTemplateAreaOutput {
        name: value.name.clone(),
        row_start: value.row_start,
        row_end: value.row_end,
        column_start: value.column_start,
        column_end: value.column_end,
    }
}

pub(crate) fn template_areas_output(value: &GridTemplateAreas<String>) -> GridTemplateAreasOutput {
    GridTemplateAreasOutput {
        areas: value.areas.iter().map(template_area_output).collect(),
        row_count: value.row_count,
        column_count: value.column_count,
    }
}
