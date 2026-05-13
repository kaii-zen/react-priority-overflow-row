import { describe, expect, it } from 'vitest';
import {
  buildPriorityOverflowGroupStates,
  selectPackedPriorityOverflowLayout,
  selectPriorityOverflowLayout,
  type PriorityOverflowGroupDefinition,
} from './priority-overflow-row';

const groups = [
  {
    variants: [
      {
        id: 'breadcrumbs',
        modes: [{ value: 'full' }, { value: 'compact', priority: 10 }],
      },
    ],
  },
  {
    wrapPriority: 100,
    variants: [
      {
        id: 'people',
        modes: [{ value: 'comfortable' }, { value: 'tight', priority: 30 }],
      },
      {
        id: 'chips',
        modes: [
          { value: 'full' },
          { value: 'short', priority: 20 },
          { value: 'icon', priority: 80 },
        ],
      },
      {
        id: 'actions',
        modes: [{ value: 'full' }, { value: 'icon', priority: 40 }],
      },
    ],
  },
  {
    variants: [
      {
        id: 'status',
        modes: [{ value: 'full' }, { value: 'dot', priority: 60 }],
      },
    ],
  },
] as const satisfies readonly PriorityOverflowGroupDefinition[];

const groupStates = groups.map((group) =>
  buildPriorityOverflowGroupStates(group),
);

describe('buildPriorityOverflowGroupStates', () => {
  it('builds group-local priority states without aggregate mode names', () => {
    expect(groupStates[1]).toEqual([
      {
        modes: {
          people: 'comfortable',
          chips: 'full',
          actions: 'full',
        },
      },
      {
        priority: 20,
        modes: {
          people: 'comfortable',
          chips: 'short',
          actions: 'full',
        },
      },
      {
        priority: 30,
        modes: {
          people: 'tight',
          chips: 'short',
          actions: 'full',
        },
      },
      {
        priority: 40,
        modes: {
          people: 'tight',
          chips: 'short',
          actions: 'icon',
        },
      },
      {
        priority: 80,
        modes: {
          people: 'tight',
          chips: 'icon',
          actions: 'icon',
        },
      },
    ]);
  });
});

describe('selectPriorityOverflowLayout', () => {
  const groupWidths = [
    [300, 180],
    [420, 360, 340, 300, 260],
    [120, 36],
  ];

  it('keeps every group expansive when the row fits', () => {
    expect(
      selectPriorityOverflowLayout({
        availableWidth: 900,
        gapWidth: 12,
        groups,
        groupStates,
        groupWidths,
      }).groupStateIndexes,
    ).toEqual([0, 0, 0]);
  });

  it('applies the cheapest compaction first', () => {
    expect(
      selectPriorityOverflowLayout({
        availableWidth: 820,
        gapWidth: 12,
        groups,
        groupStates,
        groupWidths,
      }).groupStateIndexes,
    ).toEqual([1, 0, 0]);
  });

  it('compacts actions before chips become icon-only', () => {
    expect(
      selectPriorityOverflowLayout({
        availableWidth: 630,
        gapWidth: 12,
        groups,
        groupStates,
        groupWidths,
      }).groupStateIndexes,
    ).toEqual([1, 3, 0]);
  });

  it('wraps a group only after lower-priority compactions are exhausted', () => {
    const twoGroupLayout = selectPriorityOverflowLayout({
      availableWidth: 430,
      gapWidth: 12,
      groups: groups.slice(0, 2),
      groupStates: groupStates.slice(0, 2),
      groupWidths: groupWidths.slice(0, 2),
    });

    expect(twoGroupLayout.lineBreaks).toEqual([1]);
    expect(twoGroupLayout.lines).toEqual([[0], [1]]);
  });

  it('re-expands wrapped lines independently', () => {
    const twoGroupLayout = selectPriorityOverflowLayout({
      availableWidth: 430,
      gapWidth: 12,
      groups: groups.slice(0, 2),
      groupStates: groupStates.slice(0, 2),
      groupWidths: groupWidths.slice(0, 2),
    });

    expect(twoGroupLayout.groupStateIndexes).toEqual([0, 0]);
  });

  it('keeps compacting a wrapped line when the viewport pressures it', () => {
    const twoGroupLayout = selectPriorityOverflowLayout({
      availableWidth: 330,
      gapWidth: 12,
      groups: groups.slice(0, 2),
      groupStates: groupStates.slice(0, 2),
      groupWidths: groupWidths.slice(0, 2),
    });

    expect(twoGroupLayout.lineBreaks).toEqual([1]);
    expect(twoGroupLayout.groupStateIndexes).toEqual([0, 3]);
  });

  it('isolates a wrapped middle group instead of pulling later groups with it', () => {
    const splitRightGroups = [
      {
        variants: [
          {
            id: 'breadcrumbs',
            modes: [{ value: 'full' }, { value: 'compact', priority: 10 }],
          },
        ],
      },
      {
        wrapPriority: 100,
        variants: [
          {
            id: 'people',
            modes: [{ value: 'medium' }, { value: 'small', priority: 30 }],
          },
          {
            id: 'chips',
            modes: [
              { value: 'full' },
              { value: 'short', priority: 20 },
              { value: 'icon', priority: 80 },
            ],
          },
        ],
      },
      {
        variants: [
          {
            id: 'actions',
            modes: [{ value: 'full' }, { value: 'icon', priority: 40 }],
          },
        ],
      },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const splitRightGroupStates = splitRightGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );
    const splitRightLayout = selectPriorityOverflowLayout({
      availableWidth: 500,
      gapWidth: 12,
      groups: splitRightGroups,
      groupStates: splitRightGroupStates,
      groupWidths: [
        [300, 180],
        [420, 360, 300, 260],
        [160, 80],
      ],
    });

    expect(splitRightLayout.lineBreaks).toEqual([1]);
    expect(splitRightLayout.lines).toEqual([[0, 2], [1]]);
    expect(splitRightLayout.groupStateIndexes).toEqual([0, 0, 0]);
  });

  it('re-solves isolated wrapped groups and remaining row independently', () => {
    const splitRightGroups = [
      {
        variants: [
          {
            id: 'breadcrumbs',
            modes: [{ value: 'full' }, { value: 'compact', priority: 10 }],
          },
        ],
      },
      {
        wrapPriority: 100,
        variants: [
          {
            id: 'people',
            modes: [{ value: 'medium' }, { value: 'small', priority: 30 }],
          },
          {
            id: 'chips',
            modes: [
              { value: 'full' },
              { value: 'short', priority: 20 },
              { value: 'icon', priority: 80 },
            ],
          },
        ],
      },
      {
        variants: [
          {
            id: 'actions',
            modes: [{ value: 'full' }, { value: 'icon', priority: 40 }],
          },
        ],
      },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const splitRightGroupStates = splitRightGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );
    const splitRightLayout = selectPriorityOverflowLayout({
      availableWidth: 380,
      gapWidth: 12,
      groups: splitRightGroups,
      groupStates: splitRightGroupStates,
      groupWidths: [
        [300, 180],
        [420, 360, 300, 260],
        [160, 80],
      ],
    });

    expect(splitRightLayout.lines).toEqual([[0, 2], [1]]);
    expect(splitRightLayout.groupStateIndexes).toEqual([1, 1, 0]);
  });
});

describe('selectPackedPriorityOverflowLayout', () => {
  it('fills wrapped lines with later groups when they fit', () => {
    const packedGroups = [
      { variants: [] },
      { variants: [] },
      { variants: [] },
      { variants: [] },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const packedGroupStates = packedGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );

    const layout = selectPackedPriorityOverflowLayout({
      availableWidth: 400,
      gapWidth: 10,
      groups: packedGroups,
      groupStates: packedGroupStates,
      groupWidths: [[260], [260], [120], [120]],
    });

    expect(layout.lines).toEqual([[0], [1, 2], [3]]);
    expect(layout.lineBreaks).toEqual([1, 3]);
  });

  it('compacts a candidate line before wrapping when compaction is cheaper', () => {
    const packedGroups = [
      {
        variants: [
          {
            id: 'date',
            modes: [{ value: 'full' }, { value: 'compact', priority: 10 }],
          },
        ],
      },
      { variants: [] },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const packedGroupStates = packedGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );

    const layout = selectPackedPriorityOverflowLayout({
      availableWidth: 400,
      gapWidth: 10,
      groups: packedGroups,
      groupStates: packedGroupStates,
      groupWidths: [[240, 120], [200]],
    });

    expect(layout.lines).toEqual([[0, 1]]);
    expect(layout.groupStateIndexes).toEqual([1, 0]);
  });

  it('wraps before further compaction when wrapping is cheaper', () => {
    const packedGroups = [
      {
        variants: [
          {
            id: 'date',
            modes: [{ value: 'full' }, { value: 'compact', priority: 80 }],
          },
        ],
      },
      { wrapPriority: 20, variants: [] },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const packedGroupStates = packedGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );

    const layout = selectPackedPriorityOverflowLayout({
      availableWidth: 400,
      gapWidth: 10,
      groups: packedGroups,
      groupStates: packedGroupStates,
      groupWidths: [[240, 120], [200]],
    });

    expect(layout.lines).toEqual([[0], [1]]);
    expect(layout.groupStateIndexes).toEqual([0, 0]);
  });

  it('uses a default wrap priority for groups without wrapPriority', () => {
    const packedGroups = [
      {
        variants: [
          {
            id: 'date',
            modes: [{ value: 'full' }, { value: 'compact', priority: 120 }],
          },
        ],
      },
      { variants: [] },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const packedGroupStates = packedGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );

    const layout = selectPackedPriorityOverflowLayout({
      availableWidth: 400,
      gapWidth: 10,
      groups: packedGroups,
      groupStates: packedGroupStates,
      groupWidths: [[240, 120], [200]],
    });

    expect(layout.lines).toEqual([[0], [1]]);
    expect(layout.groupStateIndexes).toEqual([0, 0]);
  });

  it('does not wrap a group with wrapPriority false', () => {
    const packedGroups = [
      { variants: [] },
      { wrapPriority: false, variants: [] },
    ] as const satisfies readonly PriorityOverflowGroupDefinition[];
    const packedGroupStates = packedGroups.map((group) =>
      buildPriorityOverflowGroupStates(group),
    );

    const layout = selectPackedPriorityOverflowLayout({
      availableWidth: 400,
      gapWidth: 10,
      groups: packedGroups,
      groupStates: packedGroupStates,
      groupWidths: [[240], [200]],
    });

    expect(layout.lines).toEqual([[0, 1]]);
    expect(layout.lineBreaks).toEqual([]);
  });
});
