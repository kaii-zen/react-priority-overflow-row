# Tutorial

This guide builds a responsive header whose children compact in a predictable,
product-controlled order.

## 1. Identify Groups

Start by grouping content that should stay together.

```tsx
<PriorityOverflowRow gap={12}>
  <PriorityOverflowRow.Group>
    <Breadcrumbs />
    <QuoteChip />
  </PriorityOverflowRow.Group>

  <PriorityOverflowRow.Group align="end" wrapPriority={100}>
    <People />
    <StatusChips />
    <Actions />
  </PriorityOverflowRow.Group>
</PriorityOverflowRow>
```

The first group stays on the left. The second group is pinned to the right and
may wrap to a new line at priority `100`.

## 2. Add Variants

Only wrap content in `Variant` when it has multiple visual representations.

```tsx
<PriorityOverflowRow.Variant
  modes={[
    { value: 'full' },
    { value: 'compact', priority: 10 },
  ] as const}
>
  {(mode) => <Breadcrumbs mode={mode} />}
</PriorityOverflowRow.Variant>
```

The render prop receives exactly one selected mode. You do not name combined
states across siblings.

## 3. Use Priorities

Lower numbers compact earlier.

```tsx
<PriorityOverflowRow.Variant
  modes={[
    { value: 'full' },
    { value: 'short', priority: 20 },
    { value: 'icon', priority: 80 },
  ] as const}
>
  {(mode) => <StatusChips mode={mode} />}
</PriorityOverflowRow.Variant>
```

This means:

1. `full` is the starting mode.
2. `short` is entered before any mode with priority above `20`.
3. `icon` is preserved until lower-cost compaction is exhausted.

## 4. Wrap As A Layout Action

Wrapping is not a mode. Put `wrapPriority` on the group:

```tsx
<PriorityOverflowRow.Group align="end" wrapPriority={100}>
  ...
</PriorityOverflowRow.Group>
```

When the row can no longer fit after all cheaper compactions, the group moves to
its own line. Each line is then solved independently, so the wrapped group can
expand again if the new line has enough width.

## 5. Keep Components Standalone

Your children can still be normal reusable components:

```tsx
function StatusChips({ mode }: { mode: 'full' | 'short' | 'icon' }) {
  return <ChipList labelMode={mode} />;
}
```

Outside a coordinated row, those components can keep their own responsive
behavior. Inside the row, the parent passes an explicit mode.
