// Generated from tools/taffy-api/contract.json. Do not edit.
#![allow(dead_code)]

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum DisplayCode {
    Block = 0,
    FlowRoot = 1,
    Flex = 2,
    Grid = 3,
    None = 4,
}

impl TryFrom<i64> for DisplayCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Block),
            1 => Ok(Self::FlowRoot),
            2 => Ok(Self::Flex),
            3 => Ok(Self::Grid),
            4 => Ok(Self::None),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum BoxSizingCode {
    BorderBox = 0,
    ContentBox = 1,
}

impl TryFrom<i64> for BoxSizingCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::BorderBox),
            1 => Ok(Self::ContentBox),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum DirectionCode {
    Ltr = 0,
    Rtl = 1,
}

impl TryFrom<i64> for DirectionCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Ltr),
            1 => Ok(Self::Rtl),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum OverflowCode {
    Visible = 0,
    Clip = 1,
    Hidden = 2,
    Scroll = 3,
}

impl TryFrom<i64> for OverflowCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Visible),
            1 => Ok(Self::Clip),
            2 => Ok(Self::Hidden),
            3 => Ok(Self::Scroll),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum FloatCode {
    Left = 0,
    Right = 1,
    None = 2,
}

impl TryFrom<i64> for FloatCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Left),
            1 => Ok(Self::Right),
            2 => Ok(Self::None),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum ClearCode {
    Left = 0,
    Right = 1,
    Both = 2,
    None = 3,
}

impl TryFrom<i64> for ClearCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Left),
            1 => Ok(Self::Right),
            2 => Ok(Self::Both),
            3 => Ok(Self::None),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum PositionCode {
    Relative = 0,
    Absolute = 1,
}

impl TryFrom<i64> for PositionCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Relative),
            1 => Ok(Self::Absolute),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum TextAlignCode {
    Auto = 0,
    LegacyLeft = 1,
    LegacyRight = 2,
    LegacyCenter = 3,
}

impl TryFrom<i64> for TextAlignCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Auto),
            1 => Ok(Self::LegacyLeft),
            2 => Ok(Self::LegacyRight),
            3 => Ok(Self::LegacyCenter),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum FlexDirectionCode {
    Row = 0,
    Column = 1,
    RowReverse = 2,
    ColumnReverse = 3,
}

impl TryFrom<i64> for FlexDirectionCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Row),
            1 => Ok(Self::Column),
            2 => Ok(Self::RowReverse),
            3 => Ok(Self::ColumnReverse),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum FlexWrapCode {
    NoWrap = 0,
    Wrap = 1,
    WrapReverse = 2,
}

impl TryFrom<i64> for FlexWrapCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::NoWrap),
            1 => Ok(Self::Wrap),
            2 => Ok(Self::WrapReverse),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum GridAutoFlowCode {
    Row = 0,
    Column = 1,
    RowDense = 2,
    ColumnDense = 3,
}

impl TryFrom<i64> for GridAutoFlowCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Row),
            1 => Ok(Self::Column),
            2 => Ok(Self::RowDense),
            3 => Ok(Self::ColumnDense),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum AlignItemsCode {
    Start = 0,
    End = 1,
    FlexStart = 2,
    FlexEnd = 3,
    SelfStart = 4,
    SelfEnd = 5,
    Center = 6,
    Baseline = 7,
    Stretch = 8,
    SafeStart = 9,
    SafeEnd = 10,
    SafeFlexStart = 11,
    SafeFlexEnd = 12,
    SafeSelfStart = 13,
    SafeSelfEnd = 14,
    SafeCenter = 15,
}

impl TryFrom<i64> for AlignItemsCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Start),
            1 => Ok(Self::End),
            2 => Ok(Self::FlexStart),
            3 => Ok(Self::FlexEnd),
            4 => Ok(Self::SelfStart),
            5 => Ok(Self::SelfEnd),
            6 => Ok(Self::Center),
            7 => Ok(Self::Baseline),
            8 => Ok(Self::Stretch),
            9 => Ok(Self::SafeStart),
            10 => Ok(Self::SafeEnd),
            11 => Ok(Self::SafeFlexStart),
            12 => Ok(Self::SafeFlexEnd),
            13 => Ok(Self::SafeSelfStart),
            14 => Ok(Self::SafeSelfEnd),
            15 => Ok(Self::SafeCenter),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum AlignContentCode {
    Start = 0,
    End = 1,
    FlexStart = 2,
    FlexEnd = 3,
    Center = 4,
    Stretch = 5,
    SpaceBetween = 6,
    SpaceEvenly = 7,
    SpaceAround = 8,
    SafeStart = 9,
    SafeEnd = 10,
    SafeFlexStart = 11,
    SafeFlexEnd = 12,
    SafeCenter = 13,
}

impl TryFrom<i64> for AlignContentCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Start),
            1 => Ok(Self::End),
            2 => Ok(Self::FlexStart),
            3 => Ok(Self::FlexEnd),
            4 => Ok(Self::Center),
            5 => Ok(Self::Stretch),
            6 => Ok(Self::SpaceBetween),
            7 => Ok(Self::SpaceEvenly),
            8 => Ok(Self::SpaceAround),
            9 => Ok(Self::SafeStart),
            10 => Ok(Self::SafeEnd),
            11 => Ok(Self::SafeFlexStart),
            12 => Ok(Self::SafeFlexEnd),
            13 => Ok(Self::SafeCenter),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum LengthUnitCode {
    Length = 0,
    Percent = 1,
    Auto = 2,
}

impl TryFrom<i64> for LengthUnitCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Length),
            1 => Ok(Self::Percent),
            2 => Ok(Self::Auto),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum AvailableSpaceKindCode {
    Definite = 0,
    MinContent = 1,
    MaxContent = 2,
}

impl TryFrom<i64> for AvailableSpaceKindCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Definite),
            1 => Ok(Self::MinContent),
            2 => Ok(Self::MaxContent),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum GridPlacementKindCode {
    Auto = 0,
    Line = 1,
    NamedLine = 2,
    Span = 3,
    NamedSpan = 4,
}

impl TryFrom<i64> for GridPlacementKindCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Auto),
            1 => Ok(Self::Line),
            2 => Ok(Self::NamedLine),
            3 => Ok(Self::Span),
            4 => Ok(Self::NamedSpan),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum TrackSizingKindCode {
    Length = 0,
    Percent = 1,
    Auto = 2,
    MinContent = 3,
    MaxContent = 4,
    FitContent = 5,
    Fr = 6,
}

impl TryFrom<i64> for TrackSizingKindCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Length),
            1 => Ok(Self::Percent),
            2 => Ok(Self::Auto),
            3 => Ok(Self::MinContent),
            4 => Ok(Self::MaxContent),
            5 => Ok(Self::FitContent),
            6 => Ok(Self::Fr),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum RepetitionCountKindCode {
    Count = 0,
    AutoFill = 1,
    AutoFit = 2,
}

impl TryFrom<i64> for RepetitionCountKindCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Count),
            1 => Ok(Self::AutoFill),
            2 => Ok(Self::AutoFit),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum GridTemplateComponentKindCode {
    Single = 0,
    Repeat = 1,
}

impl TryFrom<i64> for GridTemplateComponentKindCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Single),
            1 => Ok(Self::Repeat),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum DetailedLayoutInfoKindCode {
    None = 0,
    Grid = 1,
}

impl TryFrom<i64> for DetailedLayoutInfoKindCode {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::None),
            1 => Ok(Self::Grid),
            _ => Err(()),
        }
    }
}
