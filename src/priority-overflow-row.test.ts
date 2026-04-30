import { describe, expect, it } from 'vitest';
import {
  buildPriorityOverflowGroupStates,
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
});
