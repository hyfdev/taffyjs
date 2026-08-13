macro_rules! numeric_codes {
    (
        $(
            enum $name:ident {
                $($variant:ident = $value:literal),+ $(,)?
            }
        )+
    ) => {
        $(
            #[allow(dead_code)]
            #[derive(Clone, Copy, Debug, Eq, PartialEq)]
            #[repr(u8)]
            pub(crate) enum $name {
                $($variant = $value),+
            }

            impl TryFrom<i64> for $name {
                type Error = ();

                fn try_from(value: i64) -> Result<Self, Self::Error> {
                    match value {
                        $($value => Ok(Self::$variant)),+,
                        _ => Err(()),
                    }
                }
            }
        )+
    };
}

numeric_codes! {
    enum DisplayCode {
        Block = 0,
        FlowRoot = 1,
        Flex = 2,
        Grid = 3,
        None = 4,
    }
    enum BoxSizingCode {
        BorderBox = 0,
        ContentBox = 1,
    }
    enum DirectionCode {
        Ltr = 0,
        Rtl = 1,
    }
    enum OverflowCode {
        Visible = 0,
        Clip = 1,
        Hidden = 2,
        Scroll = 3,
    }
    enum FloatCode {
        Left = 0,
        Right = 1,
        None = 2,
    }
    enum ClearCode {
        Left = 0,
        Right = 1,
        Both = 2,
        None = 3,
    }
    enum PositionCode {
        Relative = 0,
        Absolute = 1,
    }
    enum TextAlignCode {
        Auto = 0,
        LegacyLeft = 1,
        LegacyRight = 2,
        LegacyCenter = 3,
    }
    enum FlexDirectionCode {
        Row = 0,
        Column = 1,
        RowReverse = 2,
        ColumnReverse = 3,
    }
    enum FlexWrapCode {
        NoWrap = 0,
        Wrap = 1,
        WrapReverse = 2,
    }
    enum GridAutoFlowCode {
        Row = 0,
        Column = 1,
        RowDense = 2,
        ColumnDense = 3,
    }
    enum AlignItemsCode {
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
    enum AlignContentCode {
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
    enum LengthUnitCode {
        Length = 0,
        Percent = 1,
        Auto = 2,
    }
    enum AvailableSpaceKindCode {
        Definite = 0,
        MinContent = 1,
        MaxContent = 2,
    }
    enum GridPlacementKindCode {
        Auto = 0,
        Line = 1,
        NamedLine = 2,
        Span = 3,
        NamedSpan = 4,
    }
    enum TrackSizingKindCode {
        Length = 0,
        Percent = 1,
        Auto = 2,
        MinContent = 3,
        MaxContent = 4,
        FitContent = 5,
        Fr = 6,
    }
    enum RepetitionCountKindCode {
        Count = 0,
        AutoFill = 1,
        AutoFit = 2,
    }
    enum GridTemplateComponentKindCode {
        Single = 0,
        Repeat = 1,
    }
    enum DetailedLayoutInfoKindCode {
        None = 0,
        Grid = 1,
    }
}
