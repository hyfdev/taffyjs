use napi::Env;
use napi::bindgen_prelude::Object;
use taffy::{DetailedGridInfo, DetailedGridItemsInfo, DetailedGridTracksInfo, DetailedLayoutInfo};

use crate::generated_numeric::DetailedLayoutInfoKindCode;

fn tracks_output<'env>(env: &Env, value: &DetailedGridTracksInfo) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("negativeImplicitTracks", value.negative_implicit_tracks)?;
    output.set("explicitTracks", value.explicit_tracks)?;
    output.set("positiveImplicitTracks", value.positive_implicit_tracks)?;
    output.set(
        "gutters",
        value
            .gutters
            .iter()
            .copied()
            .map(f64::from)
            .collect::<Vec<_>>(),
    )?;
    output.set(
        "sizes",
        value
            .sizes
            .iter()
            .copied()
            .map(f64::from)
            .collect::<Vec<_>>(),
    )?;
    Ok(output)
}

fn item_output<'env>(env: &Env, value: &DetailedGridItemsInfo) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("rowStart", value.row_start)?;
    output.set("rowEnd", value.row_end)?;
    output.set("columnStart", value.column_start)?;
    output.set("columnEnd", value.column_end)?;
    Ok(output)
}

fn grid_output<'env>(env: &Env, value: &DetailedGridInfo) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("rows", tracks_output(env, &value.rows)?)?;
    output.set("columns", tracks_output(env, &value.columns)?)?;
    output.set(
        "items",
        value
            .items
            .iter()
            .map(|item| item_output(env, item))
            .collect::<napi::Result<Vec<_>>>()?,
    )?;
    Ok(output)
}

pub(crate) fn output<'env>(env: &Env, value: &DetailedLayoutInfo) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    match value {
        DetailedLayoutInfo::None => {
            output.set("kind", DetailedLayoutInfoKindCode::None as u8)?;
        }
        DetailedLayoutInfo::Grid(value) => {
            output.set("kind", DetailedLayoutInfoKindCode::Grid as u8)?;
            output.set("value", grid_output(env, value)?)?;
        }
    }
    Ok(output)
}
