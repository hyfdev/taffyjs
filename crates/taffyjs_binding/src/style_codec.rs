use std::str;

use taffy::geometry::{Line, Point, Rect, Size};
use taffy::style::{
    CompactLength, Dimension, GridPlacement, GridTemplateArea, GridTemplateAreas,
    GridTemplateComponent, GridTemplateRepetition, LengthPercentage, LengthPercentageAuto,
    MaxTrackSizingFunction, MinTrackSizingFunction, Overflow, RepetitionCount, TrackSizingFunction,
};

use crate::error::{BindingResult, range_error, type_error};
use crate::number;
use crate::numeric::{
    GridPlacementKindCode, GridTemplateComponentKindCode, LengthUnitCode, RepetitionCountKindCode,
    TrackSizingKindCode,
};
use crate::style;

const STYLE_MAGIC_0: u8 = 0x54;
const STYLE_MAGIC_1: u8 = 0x53;
const SCALAR_GEOMETRY: u8 = 0x80;

pub(crate) fn replace<T: PartialEq>(current: &mut T, value: T) -> bool {
    let changed = *current != value;
    *current = value;
    changed
}

pub(crate) fn replace_f32(current: &mut f32, value: f32) -> bool {
    let changed = current.to_bits() != value.to_bits();
    *current = value;
    changed
}

pub(crate) fn replace_optional_f32(current: &mut Option<f32>, value: Option<f32>) -> bool {
    let changed = match (current.as_ref(), value.as_ref()) {
        (Some(current), Some(value)) => current.to_bits() != value.to_bits(),
        (None, None) => false,
        _ => true,
    };
    *current = value;
    changed
}

enum EncodedLength {
    Length(f64),
    Percent(f64),
    Auto,
    MinContent,
    MaxContent,
    FitContent,
    FitContentLength(f64),
    FitContentPercent(f64),
    Stretch,
    Content,
}

fn reserved_vec<T>(count: usize, name: &str) -> BindingResult<Vec<T>> {
    let mut values = Vec::new();
    values
        .try_reserve_exact(count)
        .map_err(|_| range_error(format!("{name} is too large")))?;
    Ok(values)
}

pub(crate) struct StyleDecoder<'a> {
    encoded: &'a [u8],
    presence: &'a [u8],
    offset: usize,
    field_count: usize,
}

impl<'a> StyleDecoder<'a> {
    pub(crate) fn new(
        encoded: &'a [u8],
        wire_version: u8,
        presence_bytes: usize,
        field_count: usize,
    ) -> BindingResult<Self> {
        let header_length = 4usize
            .checked_add(presence_bytes)
            .ok_or_else(|| range_error("Encoded Style header is too large"))?;
        if encoded.len() < header_length {
            return Err(type_error("Encoded Style is truncated"));
        }
        if encoded[0] != STYLE_MAGIC_0 || encoded[1] != STYLE_MAGIC_1 {
            return Err(type_error("Encoded Style has an invalid header"));
        }
        if encoded[2] != wire_version {
            return Err(type_error("Encoded Style uses an unsupported version"));
        }
        if usize::from(encoded[3]) != presence_bytes {
            return Err(type_error("Encoded Style has an invalid presence map"));
        }
        let presence = &encoded[4..header_length];
        Ok(Self {
            encoded,
            presence,
            offset: header_length,
            field_count,
        })
    }

    pub(crate) fn field(&self, index: usize) -> bool {
        self.presence[index >> 3] & (1 << (index & 7)) != 0
    }

    pub(crate) fn finish(self) -> BindingResult<()> {
        if self.offset != self.encoded.len() {
            return Err(type_error("Encoded Style contains trailing data"));
        }
        for index in self.field_count..self.presence.len() * 8 {
            if self.field(index) {
                return Err(type_error("Encoded Style contains an unknown field"));
            }
        }
        Ok(())
    }

    pub(crate) fn boolean(&mut self, name: &str) -> BindingResult<bool> {
        match self.u8(name)? {
            0 => Ok(false),
            1 => Ok(true),
            _ => Err(type_error(format!("{name} has an invalid boolean value"))),
        }
    }

    pub(crate) fn number(&mut self, name: &str) -> BindingResult<f32> {
        Ok(number::to_f32(self.f64(name)?))
    }

    pub(crate) fn nullable_number(&mut self, name: &str) -> BindingResult<Option<f32>> {
        match self.u8(name)? {
            0 => Ok(None),
            1 => self.number(name).map(Some),
            _ => Err(type_error(format!("{name} has an invalid nullable marker"))),
        }
    }

    pub(crate) fn enumeration(&mut self, name: &str) -> BindingResult<u8> {
        self.u8(name)
    }

    pub(crate) fn nullable_enumeration(&mut self, name: &str) -> BindingResult<Option<u8>> {
        match self.u8(name)? {
            0 => Ok(None),
            1 => self.enumeration(name).map(Some),
            _ => Err(type_error(format!("{name} has an invalid nullable marker"))),
        }
    }

    pub(crate) fn overflow_point(
        &mut self,
        current: &mut Point<Overflow>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b11, false, name)?;
        let mut changed = false;
        if mask & 1 != 0 {
            let value = style::overflow(f64::from(self.enumeration(name)?))?;
            changed |= replace(&mut current.x, value);
        }
        if mask & 2 != 0 {
            let value = style::overflow(f64::from(self.enumeration(name)?))?;
            changed |= replace(&mut current.y, value);
        }
        Ok(changed)
    }

    pub(crate) fn length_percentage_auto_rect(
        &mut self,
        current: &mut Rect<LengthPercentageAuto>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b1111, true, name)?;
        if mask == SCALAR_GEOMETRY {
            let value = self.length_percentage_auto(name)?;
            return Ok(replace(&mut current.left, value)
                | replace(&mut current.right, value)
                | replace(&mut current.top, value)
                | replace(&mut current.bottom, value));
        }
        let mut changed = false;
        if mask & 1 != 0 {
            changed |= replace(&mut current.left, self.length_percentage_auto(name)?);
        }
        if mask & 2 != 0 {
            changed |= replace(&mut current.right, self.length_percentage_auto(name)?);
        }
        if mask & 4 != 0 {
            changed |= replace(&mut current.top, self.length_percentage_auto(name)?);
        }
        if mask & 8 != 0 {
            changed |= replace(&mut current.bottom, self.length_percentage_auto(name)?);
        }
        Ok(changed)
    }

    pub(crate) fn dimension_size(
        &mut self,
        current: &mut Size<Dimension>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b11, true, name)?;
        if mask == SCALAR_GEOMETRY {
            let value = self.dimension(name)?;
            return Ok(replace(&mut current.width, value) | replace(&mut current.height, value));
        }
        let mut changed = false;
        if mask & 1 != 0 {
            changed |= replace(&mut current.width, self.dimension(name)?);
        }
        if mask & 2 != 0 {
            changed |= replace(&mut current.height, self.dimension(name)?);
        }
        Ok(changed)
    }

    pub(crate) fn length_percentage_auto_size(
        &mut self,
        current: &mut Size<LengthPercentageAuto>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b11, true, name)?;
        if mask == SCALAR_GEOMETRY {
            let value = self.length_percentage_auto(name)?;
            return Ok(replace(&mut current.width, value) | replace(&mut current.height, value));
        }
        let mut changed = false;
        if mask & 1 != 0 {
            changed |= replace(&mut current.width, self.length_percentage_auto(name)?);
        }
        if mask & 2 != 0 {
            changed |= replace(&mut current.height, self.length_percentage_auto(name)?);
        }
        Ok(changed)
    }

    pub(crate) fn length_percentage_rect(
        &mut self,
        current: &mut Rect<LengthPercentage>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b1111, true, name)?;
        if mask == SCALAR_GEOMETRY {
            let value = self.length_percentage(name)?;
            return Ok(replace(&mut current.left, value)
                | replace(&mut current.right, value)
                | replace(&mut current.top, value)
                | replace(&mut current.bottom, value));
        }
        let mut changed = false;
        if mask & 1 != 0 {
            changed |= replace(&mut current.left, self.length_percentage(name)?);
        }
        if mask & 2 != 0 {
            changed |= replace(&mut current.right, self.length_percentage(name)?);
        }
        if mask & 4 != 0 {
            changed |= replace(&mut current.top, self.length_percentage(name)?);
        }
        if mask & 8 != 0 {
            changed |= replace(&mut current.bottom, self.length_percentage(name)?);
        }
        Ok(changed)
    }

    pub(crate) fn length_percentage_size(
        &mut self,
        current: &mut Size<LengthPercentage>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b11, true, name)?;
        if mask == SCALAR_GEOMETRY {
            let value = self.length_percentage(name)?;
            return Ok(replace(&mut current.width, value) | replace(&mut current.height, value));
        }
        let mut changed = false;
        if mask & 1 != 0 {
            changed |= replace(&mut current.width, self.length_percentage(name)?);
        }
        if mask & 2 != 0 {
            changed |= replace(&mut current.height, self.length_percentage(name)?);
        }
        Ok(changed)
    }

    pub(crate) fn dimension(&mut self, name: &str) -> BindingResult<Dimension> {
        Ok(match self.encoded_length(true, true, name)? {
            EncodedLength::Length(value) => Dimension::length(number::to_f32(value)),
            EncodedLength::Percent(value) => Dimension::percent(number::to_f32(value / 100.0)),
            EncodedLength::Auto => Dimension::auto(),
            EncodedLength::MinContent => Dimension::min_content(),
            EncodedLength::MaxContent => Dimension::max_content(),
            EncodedLength::FitContent => Dimension::fit_content(),
            EncodedLength::FitContentLength(value) => {
                Dimension::fit_content_px(number::to_f32(value))
            }
            EncodedLength::FitContentPercent(value) => {
                Dimension::fit_content_percent(number::to_f32(value / 100.0))
            }
            EncodedLength::Stretch => Dimension::stretch(),
            EncodedLength::Content => Dimension::content(),
        })
    }

    pub(crate) fn unsigned_16(&mut self, name: &str) -> BindingResult<u16> {
        self.u16(name)
    }

    pub(crate) fn grid_template_components(
        &mut self,
        name: &str,
    ) -> BindingResult<Vec<GridTemplateComponent<String>>> {
        let count = self.count(3, name)?;
        let mut values = reserved_vec(count, name)?;
        for _ in 0..count {
            values.push(self.grid_template_component(name)?);
        }
        Ok(values)
    }

    pub(crate) fn track_sizing_functions(
        &mut self,
        name: &str,
    ) -> BindingResult<Vec<TrackSizingFunction>> {
        let count = self.count(2, name)?;
        let mut values = reserved_vec(count, name)?;
        for _ in 0..count {
            values.push(self.track_sizing_function(name)?);
        }
        Ok(values)
    }

    pub(crate) fn nullable_grid_template_areas(
        &mut self,
        name: &str,
    ) -> BindingResult<Option<GridTemplateAreas<String>>> {
        match self.u8(name)? {
            0 => Ok(None),
            1 => {
                let count = self.count(12, name)?;
                let mut areas = reserved_vec(count, name)?;
                for _ in 0..count {
                    areas.push(GridTemplateArea {
                        name: self.string(name)?,
                        row_start: self.u16(name)?,
                        row_end: self.u16(name)?,
                        column_start: self.u16(name)?,
                        column_end: self.u16(name)?,
                    });
                }
                Ok(Some(GridTemplateAreas {
                    areas,
                    row_count: self.u16(name)?,
                    column_count: self.u16(name)?,
                }))
            }
            _ => Err(type_error(format!("{name} has an invalid nullable marker"))),
        }
    }

    pub(crate) fn string_matrix(&mut self, name: &str) -> BindingResult<Vec<Vec<String>>> {
        let row_count = self.count(4, name)?;
        let mut rows = reserved_vec(row_count, name)?;
        for _ in 0..row_count {
            let column_count = self.count(4, name)?;
            let mut row = reserved_vec(column_count, name)?;
            for _ in 0..column_count {
                row.push(self.string(name)?);
            }
            rows.push(row);
        }
        Ok(rows)
    }

    pub(crate) fn grid_placement_line(
        &mut self,
        current: &mut Line<GridPlacement<String>>,
        name: &str,
    ) -> BindingResult<bool> {
        let mask = self.geometry_mask(0b11, false, name)?;
        let mut changed = false;
        if mask & 1 != 0 {
            changed |= replace(&mut current.start, self.grid_placement(name)?);
        }
        if mask & 2 != 0 {
            changed |= replace(&mut current.end, self.grid_placement(name)?);
        }
        Ok(changed)
    }

    fn length_percentage(&mut self, name: &str) -> BindingResult<LengthPercentage> {
        Ok(match self.encoded_length(false, false, name)? {
            EncodedLength::Length(value) => LengthPercentage::length(number::to_f32(value)),
            EncodedLength::Percent(value) => {
                LengthPercentage::percent(number::to_f32(value / 100.0))
            }
            EncodedLength::Auto => return Err(type_error(format!("{name} cannot be Auto"))),
            _ => return Err(type_error(format!("{name} has an invalid length tag"))),
        })
    }

    fn length_percentage_auto(&mut self, name: &str) -> BindingResult<LengthPercentageAuto> {
        Ok(match self.encoded_length(true, false, name)? {
            EncodedLength::Length(value) => LengthPercentageAuto::length(number::to_f32(value)),
            EncodedLength::Percent(value) => {
                LengthPercentageAuto::percent(number::to_f32(value / 100.0))
            }
            EncodedLength::Auto => LengthPercentageAuto::auto(),
            _ => return Err(type_error(format!("{name} has an invalid length tag"))),
        })
    }

    fn encoded_length(
        &mut self,
        allow_auto: bool,
        allow_intrinsic: bool,
        name: &str,
    ) -> BindingResult<EncodedLength> {
        match i64::from(self.u8(name)?).try_into() {
            Ok(LengthUnitCode::Length) => Ok(EncodedLength::Length(self.f64(name)?)),
            Ok(LengthUnitCode::Percent) => Ok(EncodedLength::Percent(self.f64(name)?)),
            Ok(LengthUnitCode::Auto) if allow_auto => Ok(EncodedLength::Auto),
            Ok(LengthUnitCode::Auto) => Err(type_error(format!("{name} cannot be Auto"))),
            Ok(LengthUnitCode::MinContent) if allow_intrinsic => Ok(EncodedLength::MinContent),
            Ok(LengthUnitCode::MaxContent) if allow_intrinsic => Ok(EncodedLength::MaxContent),
            Ok(LengthUnitCode::FitContent) if allow_intrinsic => Ok(EncodedLength::FitContent),
            Ok(LengthUnitCode::FitContentLength) if allow_intrinsic => {
                Ok(EncodedLength::FitContentLength(self.f64(name)?))
            }
            Ok(LengthUnitCode::FitContentPercent) if allow_intrinsic => {
                Ok(EncodedLength::FitContentPercent(self.f64(name)?))
            }
            Ok(LengthUnitCode::Stretch) if allow_intrinsic => Ok(EncodedLength::Stretch),
            Ok(LengthUnitCode::Content) if allow_intrinsic => Ok(EncodedLength::Content),
            Ok(_) => Err(type_error(format!("{name} has an invalid length tag"))),
            Err(_) => Err(type_error(format!("{name} has an invalid length tag"))),
        }
    }

    fn grid_placement(&mut self, name: &str) -> BindingResult<GridPlacement<String>> {
        Ok(match i64::from(self.u8(name)?).try_into() {
            Ok(GridPlacementKindCode::Auto) => GridPlacement::Auto,
            Ok(GridPlacementKindCode::Line) => GridPlacement::Line(self.i16(name)?.into()),
            Ok(GridPlacementKindCode::NamedLine) => {
                GridPlacement::NamedLine(self.string(name)?, self.i16(name)?)
            }
            Ok(GridPlacementKindCode::Span) => GridPlacement::Span(self.u16(name)?),
            Ok(GridPlacementKindCode::NamedSpan) => {
                GridPlacement::NamedSpan(self.string(name)?, self.u16(name)?)
            }
            Err(_) => return Err(range_error(format!("{name} has an invalid Grid placement"))),
        })
    }

    fn track_sizing_function(&mut self, name: &str) -> BindingResult<TrackSizingFunction> {
        Ok(TrackSizingFunction {
            min: self.minimum_track(name)?,
            max: self.maximum_track(name)?,
        })
    }

    fn minimum_track(&mut self, name: &str) -> BindingResult<MinTrackSizingFunction> {
        Ok(match i64::from(self.u8(name)?).try_into() {
            Ok(TrackSizingKindCode::Length) => {
                MinTrackSizingFunction::length(number::to_f32(self.f64(name)?))
            }
            Ok(TrackSizingKindCode::Percent) => {
                MinTrackSizingFunction::percent(number::to_f32(self.f64(name)? / 100.0))
            }
            Ok(TrackSizingKindCode::Auto) => MinTrackSizingFunction::auto(),
            Ok(TrackSizingKindCode::MinContent) => MinTrackSizingFunction::min_content(),
            Ok(TrackSizingKindCode::MaxContent) => MinTrackSizingFunction::max_content(),
            Ok(TrackSizingKindCode::FitContent | TrackSizingKindCode::Fr) | Err(_) => {
                return Err(type_error(format!("{name} has an invalid minimum track")));
            }
        })
    }

    fn maximum_track(&mut self, name: &str) -> BindingResult<MaxTrackSizingFunction> {
        Ok(match i64::from(self.u8(name)?).try_into() {
            Ok(TrackSizingKindCode::Length) => {
                MaxTrackSizingFunction::length(number::to_f32(self.f64(name)?))
            }
            Ok(TrackSizingKindCode::Percent) => {
                MaxTrackSizingFunction::percent(number::to_f32(self.f64(name)? / 100.0))
            }
            Ok(TrackSizingKindCode::Auto) => MaxTrackSizingFunction::auto(),
            Ok(TrackSizingKindCode::MinContent) => MaxTrackSizingFunction::min_content(),
            Ok(TrackSizingKindCode::MaxContent) => MaxTrackSizingFunction::max_content(),
            Ok(TrackSizingKindCode::FitContent) => {
                let value = self.length_percentage(name)?.into_raw();
                match value.tag() {
                    CompactLength::LENGTH_TAG => {
                        MaxTrackSizingFunction::fit_content_px(value.value())
                    }
                    CompactLength::PERCENT_TAG => {
                        MaxTrackSizingFunction::fit_content_percent(value.value())
                    }
                    _ => return Err(type_error(format!("{name} has an invalid fit-content"))),
                }
            }
            Ok(TrackSizingKindCode::Fr) => {
                MaxTrackSizingFunction::fr(number::to_f32(self.f64(name)?))
            }
            Err(_) => return Err(type_error(format!("{name} has an invalid maximum track"))),
        })
    }

    fn grid_template_component(
        &mut self,
        name: &str,
    ) -> BindingResult<GridTemplateComponent<String>> {
        Ok(match i64::from(self.u8(name)?).try_into() {
            Ok(GridTemplateComponentKindCode::Single) => {
                GridTemplateComponent::Single(self.track_sizing_function(name)?)
            }
            Ok(GridTemplateComponentKindCode::Repeat) => {
                GridTemplateComponent::Repeat(GridTemplateRepetition {
                    count: self.repetition_count(name)?,
                    tracks: self.track_sizing_functions(name)?,
                    line_names: self.string_matrix(name)?,
                })
            }
            Err(_) => {
                return Err(type_error(format!(
                    "{name} has an invalid Grid template component"
                )));
            }
        })
    }

    fn repetition_count(&mut self, name: &str) -> BindingResult<RepetitionCount> {
        Ok(match i64::from(self.u8(name)?).try_into() {
            Ok(RepetitionCountKindCode::Count) => RepetitionCount::Count(self.u16(name)?),
            Ok(RepetitionCountKindCode::AutoFill) => RepetitionCount::AutoFill,
            Ok(RepetitionCountKindCode::AutoFit) => RepetitionCount::AutoFit,
            Err(_) => {
                return Err(type_error(format!(
                    "{name} has an invalid repetition count"
                )));
            }
        })
    }

    fn geometry_mask(
        &mut self,
        component_mask: u8,
        allow_scalar: bool,
        name: &str,
    ) -> BindingResult<u8> {
        let mask = self.u8(name)?;
        if mask & SCALAR_GEOMETRY != 0 {
            if allow_scalar && mask == SCALAR_GEOMETRY {
                return Ok(mask);
            }
            return Err(type_error(format!("{name} has an invalid geometry mask")));
        }
        if mask & !component_mask != 0 {
            return Err(type_error(format!("{name} has an invalid geometry mask")));
        }
        Ok(mask)
    }

    fn count(&mut self, minimum_bytes: usize, name: &str) -> BindingResult<usize> {
        let count = usize::try_from(self.u32(name)?)
            .map_err(|_| range_error(format!("{name} is too large for this platform")))?;
        if count > self.remaining() / minimum_bytes {
            return Err(type_error(format!("{name} is truncated")));
        }
        Ok(count)
    }

    fn remaining(&self) -> usize {
        self.encoded.len() - self.offset
    }

    fn take(&mut self, count: usize, name: &str) -> BindingResult<&'a [u8]> {
        let end = self
            .offset
            .checked_add(count)
            .ok_or_else(|| range_error(format!("{name} is too large")))?;
        let value = self
            .encoded
            .get(self.offset..end)
            .ok_or_else(|| type_error(format!("{name} is truncated")))?;
        self.offset = end;
        Ok(value)
    }

    fn u8(&mut self, name: &str) -> BindingResult<u8> {
        Ok(self.take(1, name)?[0])
    }

    fn u16(&mut self, name: &str) -> BindingResult<u16> {
        let bytes: [u8; 2] = self
            .take(2, name)?
            .try_into()
            .map_err(|_| type_error(format!("{name} is truncated")))?;
        Ok(u16::from_le_bytes(bytes))
    }

    fn i16(&mut self, name: &str) -> BindingResult<i16> {
        let bytes: [u8; 2] = self
            .take(2, name)?
            .try_into()
            .map_err(|_| type_error(format!("{name} is truncated")))?;
        Ok(i16::from_le_bytes(bytes))
    }

    fn u32(&mut self, name: &str) -> BindingResult<u32> {
        let bytes: [u8; 4] = self
            .take(4, name)?
            .try_into()
            .map_err(|_| type_error(format!("{name} is truncated")))?;
        Ok(u32::from_le_bytes(bytes))
    }

    fn f64(&mut self, name: &str) -> BindingResult<f64> {
        let bytes: [u8; 8] = self
            .take(8, name)?
            .try_into()
            .map_err(|_| type_error(format!("{name} is truncated")))?;
        Ok(f64::from_le_bytes(bytes))
    }

    fn string(&mut self, name: &str) -> BindingResult<String> {
        let length = usize::try_from(self.u32(name)?)
            .map_err(|_| range_error(format!("{name} string is too large")))?;
        let bytes = self.take(length, name)?;
        let decoded = str::from_utf8(bytes)
            .map_err(|_| type_error(format!("{name} contains invalid UTF-8")))?;
        let mut value = String::new();
        value
            .try_reserve_exact(length)
            .map_err(|_| range_error(format!("{name} string is too large")))?;
        value.push_str(decoded);
        Ok(value)
    }
}

#[cfg(test)]
mod tests {
    use taffy::style::Style;

    use super::{STYLE_MAGIC_0, STYLE_MAGIC_1, StyleDecoder};
    use crate::style_input;

    const PRESENCE_BYTES: usize = 6;

    fn packet(field: Option<usize>, payload: &[u8]) -> Vec<u8> {
        let mut encoded = vec![STYLE_MAGIC_0, STYLE_MAGIC_1, 3, PRESENCE_BYTES as u8];
        encoded.resize(4 + PRESENCE_BYTES, 0);
        if let Some(field) = field {
            encoded[4 + (field >> 3)] |= 1 << (field & 7);
        }
        encoded.extend_from_slice(payload);
        encoded
    }

    #[test]
    fn rejects_invalid_headers_without_indexing_past_the_slice() {
        for encoded in [
            Vec::new(),
            vec![STYLE_MAGIC_0],
            vec![0, STYLE_MAGIC_1, 3, PRESENCE_BYTES as u8],
            vec![STYLE_MAGIC_0, STYLE_MAGIC_1, 2, PRESENCE_BYTES as u8],
            vec![STYLE_MAGIC_0, STYLE_MAGIC_1, 3, 0],
        ] {
            assert!(StyleDecoder::new(&encoded, 3, PRESENCE_BYTES, 43).is_err());
        }
    }

    #[test]
    fn rejects_truncation_trailing_data_and_unknown_presence_bits() {
        let mut target = Style::default();
        assert!(style_input::decode_into(&mut target, &packet(Some(31), &[])).is_err());
        assert!(style_input::decode_into(&mut target, &packet(None, &[0])).is_err());
        assert!(style_input::decode_into(&mut target, &packet(Some(47), &[])).is_err());
    }

    #[test]
    fn rejects_impossible_collection_lengths_before_allocating() {
        let mut target = Style::default();
        let impossible_count = u32::MAX.to_le_bytes();
        assert!(
            style_input::decode_into(&mut target, &packet(Some(39), &impossible_count)).is_err()
        );
    }

    #[test]
    fn rejects_invalid_utf8() {
        let mut payload = Vec::new();
        payload.extend_from_slice(&1u32.to_le_bytes());
        payload.extend_from_slice(&1u32.to_le_bytes());
        payload.extend_from_slice(&1u32.to_le_bytes());
        payload.push(0xff);
        let mut target = Style::default();
        assert!(style_input::decode_into(&mut target, &packet(Some(39), &payload)).is_err());
    }
}
