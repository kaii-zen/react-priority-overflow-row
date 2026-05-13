export type PriorityOverflowMode<Mode extends string> = {
  value: Mode;
  priority?: number;
};

export type PriorityOverflowVariantDefinition = {
  id: string;
  modes: readonly [
    PriorityOverflowMode<string>,
    ...PriorityOverflowMode<string>[],
  ];
};

export type PriorityOverflowGroupDefinition = {
  wrapPriority?: number | false;
  variants: readonly PriorityOverflowVariantDefinition[];
};

export type PriorityOverflowGroupState = {
  modes: Record<string, string>;
  priority?: number;
};

export type PriorityOverflowLayout = {
  groupStateIndexes: number[];
  lineBreaks: number[];
  lines: number[][];
};

export type SelectPriorityOverflowLayoutOptions = {
  availableWidth: number;
  gapWidth: number;
  groups: readonly PriorityOverflowGroupDefinition[];
  groupStates: readonly (readonly PriorityOverflowGroupState[])[];
  groupWidths: readonly (readonly (number | undefined)[])[];
};

type PriorityOverflowAction =
  | {
      kind: 'compact';
      groupIndex: number;
      priority: number;
    }
  | {
      kind: 'wrap';
      groupIndex: number;
      priority: number;
    };

export function buildPriorityOverflowGroupStates(
  group: PriorityOverflowGroupDefinition,
): PriorityOverflowGroupState[] {
  const selectedIndexes = group.variants.map(() => 0);
  const states: PriorityOverflowGroupState[] = [
    selectedModesForIndexes(group, selectedIndexes),
  ];

  for (;;) {
    let nextVariantIndex = -1;
    let nextPriority = Number.POSITIVE_INFINITY;

    group.variants.forEach((variant, variantIndex) => {
      const nextMode = variant.modes[selectedIndexes[variantIndex] + 1];

      if (
        nextMode &&
        nextMode.priority !== undefined &&
        nextMode.priority < nextPriority
      ) {
        nextVariantIndex = variantIndex;
        nextPriority = nextMode.priority;
      }
    });

    if (nextVariantIndex < 0) {
      return states;
    }

    selectedIndexes[nextVariantIndex] += 1;
    states.push({
      ...selectedModesForIndexes(group, selectedIndexes),
      priority: nextPriority,
    });
  }
}

export function selectPriorityOverflowLayout({
  availableWidth,
  gapWidth,
  groups,
  groupStates,
  groupWidths,
}: SelectPriorityOverflowLayoutOptions): PriorityOverflowLayout {
  const groupStateIndexes = groups.map(() => 0);
  const wrappedGroups = new Set<number>();

  if (
    availableWidth <= 0 ||
    groupWidths.length !== groups.length ||
    groupWidths.some((widths, groupIndex) =>
      groupStates[groupIndex].some(
        (_, stateIndex) => widths[stateIndex] === undefined,
      ),
    )
  ) {
    return layoutFromState(groupStateIndexes, wrappedGroups);
  }

  const maxIterations =
    groups.length +
    groupStates.reduce((total, states) => total + states.length, 0) *
      Math.max(groups.length, 1);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const lines = linesFromWrappedGroups(groups.length, wrappedGroups);
    const overflowingLines = lines.filter(
      (line) =>
        lineWidth(line, groupStateIndexes, groupWidths, gapWidth) >
        availableWidth,
    );

    if (overflowingLines.length === 0) {
      return {
        groupStateIndexes,
        lineBreaks: [...wrappedGroups],
        lines,
      };
    }

    const action = nextPriorityOverflowAction(
      overflowingLines,
      groups,
      groupStates,
      groupStateIndexes,
      wrappedGroups,
    );

    if (!action) {
      return {
        groupStateIndexes,
        lineBreaks: [...wrappedGroups],
        lines,
      };
    }

    if (action.kind === 'compact') {
      groupStateIndexes[action.groupIndex] += 1;
    } else {
      wrappedGroups.add(action.groupIndex);
      groupStateIndexes.fill(0);
    }
  }

  return layoutFromState(groupStateIndexes, wrappedGroups);
}

export function selectPackedPriorityOverflowLayout({
  availableWidth,
  gapWidth,
  groups,
  groupStates,
  groupWidths,
}: SelectPriorityOverflowLayoutOptions): PriorityOverflowLayout {
  const groupStateIndexes = groups.map(() => 0);
  const explicitLineBreaks = new Set<number>();

  if (
    availableWidth <= 0 ||
    groupWidths.length !== groups.length ||
    groupWidths.some((widths, groupIndex) =>
      groupStates[groupIndex].some(
        (_, stateIndex) => widths[stateIndex] === undefined,
      ),
    )
  ) {
    const lines = packedLinesFromState({
      explicitLineBreaks,
      groups,
    });

    return {
      groupStateIndexes,
      lineBreaks: lineBreaksFromLines(lines),
      lines,
    };
  }

  const maxIterations =
    groups.length +
    groupStates.reduce((total, states) => total + states.length, 0) *
      Math.max(groups.length, 1);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const action = nextPackedPriorityOverflowAction({
      availableWidth,
      explicitLineBreaks,
      gapWidth,
      groups,
      groupStateIndexes,
      groupStates,
      groupWidths,
    });

    if (!action) {
      const lines = packedLinesFromState({
        explicitLineBreaks,
        groups,
      });

      return {
        groupStateIndexes,
        lineBreaks: lineBreaksFromLines(lines),
        lines,
      };
    }

    if (action.kind === 'compact') {
      groupStateIndexes[action.groupIndex] += 1;
    } else {
      explicitLineBreaks.add(action.groupIndex);
    }
  }

  const lines = packedLinesFromState({
    explicitLineBreaks,
    groups,
  });

  return {
    groupStateIndexes,
    lineBreaks: lineBreaksFromLines(lines),
    lines,
  };
}

function nextPriorityOverflowAction(
  overflowingLines: readonly (readonly number[])[],
  groups: readonly PriorityOverflowGroupDefinition[],
  groupStates: readonly (readonly PriorityOverflowGroupState[])[],
  groupStateIndexes: readonly number[],
  wrappedGroups: ReadonlySet<number>,
): PriorityOverflowAction | undefined {
  const actions: PriorityOverflowAction[] = [];

  overflowingLines.forEach((line) => {
    line.forEach((groupIndex, lineIndex) => {
      const nextGroupState =
        groupStates[groupIndex][groupStateIndexes[groupIndex] + 1];

      if (nextGroupState?.priority !== undefined) {
        actions.push({
          kind: 'compact',
          groupIndex,
          priority: nextGroupState.priority,
        });
      }

      if (lineIndex > 0) {
        const { wrapPriority } = groups[groupIndex];

        if (
          wrapPriority !== undefined &&
          wrapPriority !== false &&
          !wrappedGroups.has(groupIndex)
        ) {
          actions.push({
            kind: 'wrap',
            groupIndex,
            priority: wrapPriority,
          });
        }
      }
    });
  });

  return actions.sort(priorityOverflowActionSort)[0];
}

function nextPackedPriorityOverflowAction({
  availableWidth,
  explicitLineBreaks,
  gapWidth,
  groups,
  groupStateIndexes,
  groupStates,
  groupWidths,
}: {
  availableWidth: number;
  explicitLineBreaks: ReadonlySet<number>;
  gapWidth: number;
  groups: readonly PriorityOverflowGroupDefinition[];
  groupStateIndexes: readonly number[];
  groupStates: readonly (readonly PriorityOverflowGroupState[])[];
  groupWidths: readonly (readonly (number | undefined)[])[];
}): PriorityOverflowAction | undefined {
  let currentLine: number[] = [];
  let currentLineWidth = 0;

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const groupWidth = groupWidthForState(
      groupIndex,
      groupStateIndexes,
      groupWidths,
    );

    if (explicitLineBreaks.has(groupIndex) && currentLine.length > 0) {
      currentLine = [];
      currentLineWidth = 0;
    }

    if (currentLine.length === 0) {
      currentLine = [groupIndex];
      currentLineWidth = groupWidth;
      continue;
    }

    const nextLineWidth = currentLineWidth + gapWidth + groupWidth;

    if (nextLineWidth <= availableWidth) {
      currentLine.push(groupIndex);
      currentLineWidth = nextLineWidth;
      continue;
    }

    const action = nextPackedLineAction({
      candidateGroupIndex: groupIndex,
      currentLine,
      explicitLineBreaks,
      groups,
      groupStateIndexes,
      groupStates,
    });

    if (action) {
      return action;
    }

    currentLine.push(groupIndex);
    currentLineWidth = nextLineWidth;
  }

  return undefined;
}

function nextPackedLineAction({
  candidateGroupIndex,
  currentLine,
  explicitLineBreaks,
  groups,
  groupStateIndexes,
  groupStates,
}: {
  candidateGroupIndex: number;
  currentLine: readonly number[];
  explicitLineBreaks: ReadonlySet<number>;
  groups: readonly PriorityOverflowGroupDefinition[];
  groupStateIndexes: readonly number[];
  groupStates: readonly (readonly PriorityOverflowGroupState[])[];
}): PriorityOverflowAction | undefined {
  const actions: PriorityOverflowAction[] = [];

  [...currentLine, candidateGroupIndex].forEach((groupIndex) => {
    const nextGroupState =
      groupStates[groupIndex][groupStateIndexes[groupIndex] + 1];

    if (nextGroupState?.priority !== undefined) {
      actions.push({
        kind: 'compact',
        groupIndex,
        priority: nextGroupState.priority,
      });
    }
  });

  const wrapPriority = packedWrapPriority(groups[candidateGroupIndex]);

  if (
    wrapPriority !== undefined &&
    !explicitLineBreaks.has(candidateGroupIndex)
  ) {
    actions.push({
      kind: 'wrap',
      groupIndex: candidateGroupIndex,
      priority: wrapPriority,
    });
  }

  return actions.sort(priorityOverflowActionSort)[0];
}

function priorityOverflowActionSort(
  left: PriorityOverflowAction,
  right: PriorityOverflowAction,
) {
  if (left.priority !== right.priority) {
    return left.priority - right.priority;
  }

  if (left.kind !== right.kind) {
    return left.kind === 'compact' ? -1 : 1;
  }

  return left.groupIndex - right.groupIndex;
}

function layoutFromState(
  groupStateIndexes: readonly number[],
  wrappedGroups: ReadonlySet<number>,
): PriorityOverflowLayout {
  return {
    groupStateIndexes: [...groupStateIndexes],
    lineBreaks: [...wrappedGroups],
    lines: linesFromWrappedGroups(groupStateIndexes.length, wrappedGroups),
  };
}

function linesFromWrappedGroups(
  groupCount: number,
  wrappedGroups: ReadonlySet<number>,
): number[][] {
  const unwrappedLine: number[] = [];
  const wrappedLines: number[][] = [];

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    if (wrappedGroups.has(groupIndex)) {
      wrappedLines.push([groupIndex]);
    } else {
      unwrappedLine.push(groupIndex);
    }
  }

  return unwrappedLine.length > 0
    ? [unwrappedLine, ...wrappedLines]
    : wrappedLines;
}

function packedLinesFromState({
  explicitLineBreaks,
  groups,
}: {
  explicitLineBreaks: ReadonlySet<number>;
  groups: readonly PriorityOverflowGroupDefinition[];
}) {
  const lines: number[][] = [];
  let currentLine: number[] = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const startsExplicitLine =
      currentLine.length > 0 && explicitLineBreaks.has(groupIndex);

    if (startsExplicitLine) {
      lines.push(currentLine);
      currentLine = [];
    }

    currentLine.push(groupIndex);
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

function groupWidthForState(
  groupIndex: number,
  groupStateIndexes: readonly number[],
  groupWidths: readonly (readonly (number | undefined)[])[],
) {
  return groupWidths[groupIndex][groupStateIndexes[groupIndex]] ?? 0;
}

function packedWrapPriority(group: PriorityOverflowGroupDefinition) {
  if (group.wrapPriority === false) {
    return undefined;
  }

  return group.wrapPriority ?? 100;
}

function lineBreaksFromLines(lines: readonly (readonly number[])[]) {
  return lines
    .slice(1)
    .map((line) => line[0])
    .filter((groupIndex) => groupIndex !== undefined);
}

function lineWidth(
  line: readonly number[],
  groupStateIndexes: readonly number[],
  groupWidths: readonly (readonly (number | undefined)[])[],
  gapWidth: number,
): number {
  return (
    line.reduce(
      (totalWidth, groupIndex) =>
        totalWidth +
        (groupWidths[groupIndex][groupStateIndexes[groupIndex]] ?? 0),
      0,
    ) +
    Math.max(line.length - 1, 0) * gapWidth
  );
}

function selectedModesForIndexes(
  group: PriorityOverflowGroupDefinition,
  selectedIndexes: readonly number[],
): PriorityOverflowGroupState {
  return {
    modes: Object.fromEntries(
      group.variants.map((variant, variantIndex) => [
        variant.id,
        variant.modes[selectedIndexes[variantIndex]].value,
      ]),
    ),
  };
}
