export interface ExpectedFailureGroup {
  readonly classification: "different" | "unsupported";
  readonly capability: string;
  readonly titles: readonly string[];
}

export const expectedFailureGroups = [
  {
    classification: "unsupported",
    capability: "PositionType.Static",
    titles: [
      "absolute_layout_padding",
      "absolute_layout_border",
      "box_sizing_content_box_comtaining_block",
      "box_sizing_border_box_comtaining_block",
      "static_position_insets_have_no_effect_left_top",
      "static_position_insets_have_no_effect_right_bottom",
      "static_position_absolute_child_insets_relative_to_positioned_ancestor",
      "static_position_absolute_child_insets_relative_to_positioned_ancestor_row_reverse",
      "column_reverse_static_position_absolute_child_insets_relative_to_positioned_ancestor_row_reverse",
      "static_position_absolute_child_insets_relative_to_positioned_ancestor_row",
      "column_reverse_static_position_absolute_child_insets_relative_to_positioned_ancestor_row",
      "static_position_absolute_child_insets_relative_to_positioned_ancestor_column_reverse",
      "column_reverse_static_position_absolute_child_insets_relative_to_positioned_ancestor_column_reverse",
      "static_position_absolute_child_insets_relative_to_positioned_ancestor_deep",
      "static_position_absolute_child_width_percentage",
      "static_position_relative_child_width_percentage",
      "static_position_static_child_width_percentage",
      "static_position_absolute_child_height_percentage",
      "static_position_relative_child_height_percentage",
      "static_position_static_child_height_percentage",
      "static_position_absolute_child_left_percentage",
      "static_position_relative_child_left_percentage",
      "static_position_static_child_left_percentage",
      "static_position_absolute_child_right_percentage",
      "static_position_relative_child_right_percentage",
      "static_position_static_child_right_percentage",
      "static_position_absolute_child_top_percentage",
      "static_position_relative_child_top_percentage",
      "static_position_static_child_top_percentage",
      "static_position_absolute_child_bottom_percentage",
      "static_position_relative_child_bottom_percentage",
      "static_position_static_child_bottom_percentage",
      "static_position_absolute_child_margin_percentage",
      "static_position_relative_child_margin_percentage",
      "static_position_static_child_margin_percentage",
      "static_position_absolute_child_padding_percentage",
      "static_position_relative_child_padding_percentage",
      "static_position_static_child_padding_percentage",
      "static_position_absolute_child_border_percentage",
      "static_position_relative_child_border_percentage",
      "static_position_static_child_border_percentage",
      "static_position_absolute_child_containing_block_padding_box",
      "static_position_relative_child_containing_block_padding_box",
      "static_position_static_child_containing_block_padding_box",
      "static_position_static_child_containing_block_content_box",
      "static_position_containing_block_padding_and_border",
      "static_position_amalgamation",
      "static_position_no_position_amalgamation",
      "static_position_zero_for_inset_amalgamation",
      "static_position_start_inset_amalgamation",
      "static_position_end_inset_amalgamation",
      "static_position_row_reverse_amalgamation",
      "static_position_column_reverse_amalgamation",
      "static_position_justify_flex_start_amalgamation",
      "static_position_justify_flex_start_position_set_amalgamation",
      "static_position_no_definite_size_amalgamation",
      "static_position_both_insets_set_amalgamation",
      "static_position_justify_center_amalgamation",
      "static_position_justify_flex_end_amalgamation",
      "static_position_align_flex_start_amalgamation",
      "static_position_align_center_amalgamation",
      "static_position_align_flex_end_amalgamation",
      "static_position_static_root",
      "static_position_absolute_child_multiple",
    ],
  },
  {
    classification: "unsupported",
    capability: "Display.Contents",
    titles: [
      "test1",
      "display_contents",
      "display_contents_fixed_size",
      "display_contents_with_margin",
      "display_contents_with_padding",
      "display_contents_with_position",
      "display_contents_with_position_absolute",
      "display_contents_nested",
      "display_contents_with_siblings",
    ],
  },
  {
    classification: "unsupported",
    capability: "nonzero Yoga Errata",
    titles: ["errata_all_contains_example_errata", "errata_is_settable"],
  },
  {
    classification: "unsupported",
    capability: "setIsReferenceBaseline(true)",
    titles: [
      "align_baseline_parent_using_child_in_column_as_reference",
      "align_baseline_parent_using_child_in_row_as_reference",
    ],
  },
  {
    classification: "different",
    capability: "Measure callback count and phase trace",
    titles: [
      "measure_once_single_flexible_child",
      "dont_measure_single_grow_shrink_child",
      "dont_fail_with_incomplete_measure_dimensions",
    ],
  },
  {
    classification: "different",
    capability: "oversized cross-axis auto-margin alignment",
    titles: [
      "margin_auto_left_right_child_bigger_than_parent",
      "margin_auto_left_child_bigger_than_parent",
      "margin_fix_left_auto_right_child_bigger_than_parent",
      "margin_auto_left_fix_right_child_bigger_than_parent",
    ],
  },
] as const satisfies readonly ExpectedFailureGroup[];

export const expectedFailureByTitle = new Map<string, ExpectedFailureGroup>();

for (const group of expectedFailureGroups) {
  for (const title of group.titles) {
    if (expectedFailureByTitle.has(title)) {
      throw new Error(`Duplicate Yoga official expected failure: ${title}`);
    }
    expectedFailureByTitle.set(title, group);
  }
}
