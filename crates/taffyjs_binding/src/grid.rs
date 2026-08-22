use napi::bindgen_prelude::Either;
use napi_derive::napi;
use taffy::style::{
    CompactLength, GridPlacement, GridTemplateArea, GridTemplateAreas, GridTemplateComponent,
    GridTemplateRepetition, MaxTrackSizingFunction, MinTrackSizingFunction, RepetitionCount,
    TrackSizingFunction,
};

use crate::error::{BindingResult, range_error};
use crate::length::LengthOutput;
use crate::numeric::{
    GridPlacementKindCode, GridTemplateComponentKindCode, RepetitionCountKindCode,
    TrackSizingKindCode,
};

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

pub(crate) fn validate_template_line_names(
    values: &[GridTemplateComponent<String>],
) -> BindingResult<()> {
    for value in values {
        if let GridTemplateComponent::Repeat(repetition) = value
            && !repetition.line_names.is_empty()
            && repetition.line_names.len() != repetition.tracks.len() + 1
        {
            return Err(range_error(
                "A Grid repetition requires either no lineNames entries or one more than its tracks",
            ));
        }
    }
    Ok(())
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
