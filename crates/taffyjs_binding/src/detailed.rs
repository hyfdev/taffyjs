use napi_derive::napi;
use taffy::{DetailedGridInfo, DetailedGridItemsInfo, DetailedGridTracksInfo, DetailedLayoutInfo};

use crate::generated_numeric::DetailedLayoutInfoKindCode;

#[napi(object, object_from_js = false)]
pub struct DetailedGridTracksOutput {
    pub negative_implicit_tracks: u16,
    pub explicit_tracks: u16,
    pub positive_implicit_tracks: u16,
    pub gutters: Vec<f64>,
    pub sizes: Vec<f64>,
}

#[napi(object, object_from_js = false)]
pub struct DetailedGridItemOutput {
    pub row_start: u16,
    pub row_end: u16,
    pub column_start: u16,
    pub column_end: u16,
}

#[napi(object, object_from_js = false)]
pub struct DetailedGridOutput {
    pub rows: DetailedGridTracksOutput,
    pub columns: DetailedGridTracksOutput,
    pub items: Vec<DetailedGridItemOutput>,
}

#[napi(object, object_from_js = false)]
pub struct DetailedLayoutOutput {
    pub kind: u8,
    pub value: Option<DetailedGridOutput>,
}

fn tracks_output(value: &DetailedGridTracksInfo) -> DetailedGridTracksOutput {
    DetailedGridTracksOutput {
        negative_implicit_tracks: value.negative_implicit_tracks,
        explicit_tracks: value.explicit_tracks,
        positive_implicit_tracks: value.positive_implicit_tracks,
        gutters: value.gutters.iter().copied().map(f64::from).collect(),
        sizes: value.sizes.iter().copied().map(f64::from).collect(),
    }
}

fn item_output(value: &DetailedGridItemsInfo) -> DetailedGridItemOutput {
    DetailedGridItemOutput {
        row_start: value.row_start,
        row_end: value.row_end,
        column_start: value.column_start,
        column_end: value.column_end,
    }
}

fn grid_output(value: &DetailedGridInfo) -> DetailedGridOutput {
    DetailedGridOutput {
        rows: tracks_output(&value.rows),
        columns: tracks_output(&value.columns),
        items: value.items.iter().map(item_output).collect(),
    }
}

pub(crate) fn output(value: &DetailedLayoutInfo) -> DetailedLayoutOutput {
    match value {
        DetailedLayoutInfo::None => DetailedLayoutOutput {
            kind: DetailedLayoutInfoKindCode::None as u8,
            value: None,
        },
        DetailedLayoutInfo::Grid(value) => DetailedLayoutOutput {
            kind: DetailedLayoutInfoKindCode::Grid as u8,
            value: Some(grid_output(value)),
        },
    }
}
