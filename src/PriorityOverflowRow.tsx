import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import useMeasure from 'react-use-measure';
import {
  buildPriorityOverflowGroupStates,
  selectPriorityOverflowLayout,
  type PriorityOverflowGroupDefinition,
  type PriorityOverflowGroupState,
  type PriorityOverflowMode,
  type PriorityOverflowVariantDefinition,
} from './priority-overflow-row';

export type PriorityOverflowGap = number | string;

export type PriorityOverflowRowProps = {
  /**
   * Gap between groups and between wrapped lines. Numeric values are treated as
   * CSS pixels. Strings are passed through as CSS values.
   */
  gap?: PriorityOverflowGap;
  /**
   * Row content. Place each coordinated cluster in a
   * `PriorityOverflowRow.Group`.
   */
  children: ReactNode;
  /**
   * Optional class name applied to the row root.
   */
  className?: string;
  /**
   * Optional inline styles applied to the row root.
   */
  style?: CSSProperties;
};

export type PriorityOverflowGroupProps = {
  /**
   * Pins the group to the end of its current line. This is useful for
   * right-side action clusters in headers and toolbars.
   */
  align?: 'start' | 'end';
  /**
   * Gap between children inside the group. Defaults to the row `gap`. Numeric
   * values are treated as CSS pixels. Strings are passed through as CSS values.
   */
  gap?: PriorityOverflowGap;
  /**
   * Priority cost for moving this group to a new line. Lower values wrap
   * earlier. Omit this prop for groups that should not wrap independently.
   */
  wrapPriority?: number;
  /**
   * Fixed children and `PriorityOverflowRow.Variant` children rendered in this
   * group.
   */
  children: ReactNode;
};

export type PriorityOverflowVariantProps<
  Modes extends readonly [
    PriorityOverflowMode<string>,
    ...PriorityOverflowMode<string>[],
  ],
> = {
  /**
   * Modes ordered from most expansive to most compact. The first mode is used
   * by default. Each later mode may declare a `priority`, which is the cost to
   * enter that smaller representation.
   */
  modes: Modes;
  /**
   * Render prop that receives the selected mode value for this variant.
   */
  children: (mode: Modes[number]['value']) => ReactNode;
};

type ParsedPriorityOverflowGroup = PriorityOverflowGroupProps & {
  index: number;
  key: string;
  variants: PriorityOverflowGroupDefinition['variants'];
};

type GroupMeasurementProps = {
  group: ParsedPriorityOverflowGroup;
  groupGap: string;
  state: PriorityOverflowGroupState;
  stateIndex: number;
  onResize: (groupIndex: number, stateIndex: number, width: number) => void;
};

type GapMeasurementProps = {
  gap: string;
  onResize: (width: number) => void;
};

function PriorityOverflowGroup(_props: PriorityOverflowGroupProps) {
  return null;
}

function PriorityOverflowVariant<
  Modes extends readonly [
    PriorityOverflowMode<string>,
    ...PriorityOverflowMode<string>[],
  ],
>(_props: PriorityOverflowVariantProps<Modes>) {
  return null;
}

function GroupMeasurement({
  group,
  groupGap,
  state,
  stateIndex,
  onResize,
}: GroupMeasurementProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [measureRef, bounds, refresh] = useMeasure();
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      measureRef(node);
    },
    [measureRef],
  );

  useLayoutEffect(() => {
    refresh();
  }, [refresh]);

  useLayoutEffect(() => {
    onResize(group.index, stateIndex, measuredWidth(elementRef.current, bounds));
  }, [bounds, group.index, onResize, stateIndex]);

  return (
    <div
      ref={ref}
      style={{
        ...measurementStyle,
        ...groupStyle,
        gap: groupGap,
      }}
    >
      {renderGroupChildren(group, state.modes)}
    </div>
  );
}

function GapMeasurement({ gap, onResize }: GapMeasurementProps) {
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const [measureRef, bounds, refresh] = useMeasure();
  const ref = useCallback(
    (node: HTMLSpanElement | null) => {
      elementRef.current = node;
      measureRef(node);
    },
    [measureRef],
  );

  useLayoutEffect(() => {
    refresh();
  }, [refresh]);

  useLayoutEffect(() => {
    onResize(measuredWidth(elementRef.current, bounds));
  }, [bounds, onResize]);

  return (
    <span ref={ref} style={{ ...measurementStyle, gap }}>
      <span />
      <span />
    </span>
  );
}

function PriorityOverflowRowRoot({
  gap = 0,
  children,
  className,
  style,
}: PriorityOverflowRowProps) {
  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const [measureRootRef, bounds, refreshRoot] = useMeasure();
  const rootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootElementRef.current = node;
      measureRootRef(node);
    },
    [measureRootRef],
  );
  const rowGap = resolvePriorityOverflowGap(gap);
  const groups = useMemo(
    () => parsePriorityOverflowGroups(children),
    [children],
  );
  const groupStates = useMemo(
    () => groups.map((group) => buildPriorityOverflowGroupStates(group)),
    [groups],
  );
  const groupStatesRef = useRef(groupStates);
  groupStatesRef.current = groupStates;
  const groupStateSignature = JSON.stringify(
    groups.map((group, groupIndex) => ({
      groupIndex,
      wrapPriority: group.wrapPriority,
      variants: group.variants,
    })),
  );
  const [gapWidth, setGapWidth] = useState(0);
  const [groupWidths, setGroupWidths] = useState<(number | undefined)[][]>(() =>
    widthsForGroupStates(groupStates),
  );

  useLayoutEffect(() => {
    refreshRoot();
  }, [refreshRoot]);

  useLayoutEffect(() => {
    const nextGroupStates = groupStatesRef.current;

    setGroupWidths((currentWidths) =>
      currentWidths.length === nextGroupStates.length
        ? nextGroupStates.map((states, groupIndex) =>
            Array.from(
              { length: states.length },
              (_, stateIndex) => currentWidths[groupIndex]?.[stateIndex],
            ),
          )
        : widthsForGroupStates(nextGroupStates),
    );
  }, [groupStateSignature]);

  const updateGroupWidth = useCallback(
    (groupIndex: number, stateIndex: number, width: number) => {
      setGroupWidths((currentWidths) => {
        if (currentWidths[groupIndex]?.[stateIndex] === width) {
          return currentWidths;
        }

        const nextWidths = currentWidths.map((widths) => [...widths]);
        nextWidths[groupIndex][stateIndex] = width;
        return nextWidths;
      });
    },
    [],
  );
  const availableWidth = availableElementWidth(rootElementRef.current, bounds);
  const groupDefinitions = groups.map<PriorityOverflowGroupDefinition>(
    (group) => ({
      wrapPriority: group.wrapPriority,
      variants: group.variants,
    }),
  );
  const layout = selectPriorityOverflowLayout({
    availableWidth,
    gapWidth: gapWidth || cssPixels(rowGap),
    groups: groupDefinitions,
    groupStates,
    groupWidths,
  });

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...rootStyle,
        ...style,
        gap: rowGap,
      }}
    >
      {layout.lines.map((line) => (
        <div key={line.join('-')} style={{ ...lineStyle, gap: rowGap }}>
          {line.map((groupIndex) => {
            const group = groups[groupIndex];
            const groupState =
              groupStates[groupIndex][layout.groupStateIndexes[groupIndex]];
            const groupGap = resolvePriorityOverflowGap(group.gap ?? gap);

            return (
              <div
                key={group.key}
                style={{
                  ...groupStyle,
                  gap: groupGap,
                  marginInlineStart: group.align === 'end' ? 'auto' : undefined,
                }}
              >
                {renderGroupChildren(group, groupState.modes)}
              </div>
            );
          })}
        </div>
      ))}
      <div aria-hidden="true" style={measurementsStyle}>
        <GapMeasurement gap={rowGap} onResize={setGapWidth} />
        {groups.flatMap((group) => {
          const groupGap = resolvePriorityOverflowGap(group.gap ?? gap);

          return groupStates[group.index].map((state, stateIndex) => (
            <GroupMeasurement
              key={`${group.key}:${Object.values(state.modes).join('|')}`}
              group={group}
              groupGap={groupGap}
              state={state}
              stateIndex={stateIndex}
              onResize={updateGroupWidth}
            />
          ));
        })}
      </div>
    </div>
  );
}

function parsePriorityOverflowGroups(
  children: ReactNode,
): ParsedPriorityOverflowGroup[] {
  const groups: ParsedPriorityOverflowGroup[] = [];

  flattenFragments(children).forEach((child) => {
    if (!isPriorityOverflowGroupElement(child)) {
      return;
    }

    const index = groups.length;
    groups.push({
      ...child.props,
      index,
      key: child.key === null ? String(index) : String(child.key),
      variants: collectPriorityOverflowVariants(child.props.children, index),
    });
  });

  return groups;
}

function collectPriorityOverflowVariants(
  children: ReactNode,
  groupIndex: number,
): PriorityOverflowGroupDefinition['variants'] {
  let variantIndex = 0;
  const variants: PriorityOverflowVariantDefinition[] = [];

  flattenFragments(children).forEach((child) => {
    if (!isPriorityOverflowVariantElement(child)) {
      return;
    }

    variants.push({
      id: variantId(groupIndex, variantIndex),
      modes: child.props.modes,
    });
    variantIndex += 1;
  });

  return variants;
}

function renderGroupChildren(
  group: ParsedPriorityOverflowGroup,
  selectedModes: Record<string, string>,
): ReactNode {
  let variantIndex = 0;

  return flattenFragments(group.children).map((child, childIndex) => {
    if (!isPriorityOverflowVariantElement(child)) {
      return child;
    }

    const mode =
      selectedModes[variantId(group.index, variantIndex)] ??
      child.props.modes[0].value;
    variantIndex += 1;

    return (
      <Fragment key={child.key ?? childIndex}>
        {child.props.children(mode)}
      </Fragment>
    );
  });
}

function flattenFragments(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isFragmentElement(child)) {
      return flattenFragments(child.props.children);
    }

    return child;
  });
}

function isFragmentElement(
  child: ReactNode,
): child is ReactElement<{ children?: ReactNode }> {
  return isValidElement(child) && child.type === Fragment;
}

function isPriorityOverflowGroupElement(
  child: ReactNode,
): child is ReactElement<PriorityOverflowGroupProps> {
  return isValidElement(child) && child.type === PriorityOverflowGroup;
}

function isPriorityOverflowVariantElement(
  child: ReactNode,
): child is ReactElement<
  PriorityOverflowVariantProps<
    readonly [PriorityOverflowMode<string>, ...PriorityOverflowMode<string>[]]
  >
> {
  return isValidElement(child) && child.type === PriorityOverflowVariant;
}

function variantId(groupIndex: number, variantIndex: number) {
  return `${groupIndex}:${variantIndex}`;
}

function widthsForGroupStates(
  groupStates: readonly (readonly PriorityOverflowGroupState[])[],
) {
  return groupStates.map((states) =>
    Array.from({ length: states.length }, () => undefined),
  );
}

function resolvePriorityOverflowGap(gap: PriorityOverflowGap) {
  return typeof gap === 'number' ? `${gap}px` : gap;
}

function cssPixels(value: string) {
  return value.endsWith('px') ? Number.parseFloat(value) || 0 : 0;
}

function measuredWidth(element: HTMLElement | null, bounds: { width: number }) {
  return Math.max(
    bounds.width,
    element?.getBoundingClientRect().width ?? 0,
    element?.scrollWidth ?? 0,
    element?.offsetWidth ?? 0,
  );
}

function availableElementWidth(
  element: HTMLElement | null,
  bounds: { width: number },
) {
  return Math.max(
    bounds.width,
    element?.getBoundingClientRect().width ?? 0,
    element?.offsetWidth ?? 0,
  );
}

const rootStyle = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  maxWidth: '100%',
} satisfies CSSProperties;

const lineStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  minWidth: 0,
  maxWidth: '100%',
} satisfies CSSProperties;

const groupStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  flex: '0 0 auto',
  width: 'max-content',
  minWidth: 0,
  maxWidth: 'none',
} satisfies CSSProperties;

const measurementsStyle = {
  position: 'absolute',
  inset: '0 auto auto 0',
  visibility: 'hidden',
  pointerEvents: 'none',
  overflow: 'visible',
  zIndex: -1,
} satisfies CSSProperties;

const measurementStyle = {
  position: 'absolute',
  display: 'inline-flex',
  inset: '0 auto auto 0',
  inlineSize: 'max-content',
  maxInlineSize: 'none',
  maxWidth: 'none',
  whiteSpace: 'nowrap',
} satisfies CSSProperties;

const PriorityOverflowRow = Object.assign(PriorityOverflowRowRoot, {
  Group: PriorityOverflowGroup,
  Variant: PriorityOverflowVariant,
});

export default PriorityOverflowRow;
