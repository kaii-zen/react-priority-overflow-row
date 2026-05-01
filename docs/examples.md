# Examples

## Header With Breadcrumbs And Actions

```tsx
<PriorityOverflowRow gap={12}>
  <PriorityOverflowRow.Group gap={10}>
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'compact', priority: 10 },
      ] as const}
    >
      {(mode) => <Breadcrumbs mode={mode} />}
    </PriorityOverflowRow.Variant>
    <QuoteChip />
  </PriorityOverflowRow.Group>

  <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={100}>
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'comfortable' },
        { value: 'tight', priority: 30 },
      ] as const}
    >
      {(spacing) => <People spacing={spacing} />}
    </PriorityOverflowRow.Variant>

    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'short', priority: 20 },
        { value: 'icon', priority: 80 },
      ] as const}
    >
      {(mode) => <StatusChips mode={mode} />}
    </PriorityOverflowRow.Variant>

    <Divider />

    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'icon', priority: 40 },
      ] as const}
    >
      {(mode) => <Actions mode={mode} />}
    </PriorityOverflowRow.Variant>
  </PriorityOverflowRow.Group>
</PriorityOverflowRow>
```

Behavior:

- Breadcrumbs compact first.
- Status chips shorten before people spacing tightens.
- Actions become icons before status chips become icon-only.
- The right group wraps after cheaper compactions are exhausted.

## Toolbar

```tsx
<PriorityOverflowRow gap={10}>
  <PriorityOverflowRow.Group>
    <strong>Quote 173603</strong>
  </PriorityOverflowRow.Group>

  <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={90}>
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'short', priority: 20 },
        { value: 'icon', priority: 60 },
      ] as const}
    >
      {(mode) => (
        <>
          <ToolbarButton mode={mode} icon={<Refresh />} label="Refresh" />
          <ToolbarButton mode={mode} icon={<Print />} label="Print preview" />
          <ToolbarButton mode={mode} icon={<Cube />} label="Approval drawing" />
        </>
      )}
    </PriorityOverflowRow.Variant>

    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'icon', priority: 35 },
      ] as const}
    >
      {(mode) => <SaveButton mode={mode} />}
    </PriorityOverflowRow.Variant>
  </PriorityOverflowRow.Group>
</PriorityOverflowRow>
```

Behavior:

- Save compacts before the main toolbar actions become icon-only.
- The action group wraps at priority `90`.
- Once wrapped, it re-expands according to the new line width.
