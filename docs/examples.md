# Examples

## Workspace Header

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
    <ItemBadge />
  </PriorityOverflowRow.Group>

  <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={100}>
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'comfortable' },
        { value: 'tight', priority: 30 },
      ] as const}
    >
      {(spacing) => <Avatars spacing={spacing} />}
    </PriorityOverflowRow.Variant>

    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'short', priority: 20 },
        { value: 'icon', priority: 80 },
      ] as const}
    >
      {(mode) => <FilterChips mode={mode} />}
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
- Filters shorten before avatar spacing tightens.
- Actions become icons before filters become icon-only.
- The right group wraps after cheaper compactions are exhausted.

## Adaptive Toolbar

```tsx
<PriorityOverflowRow gap={10}>
  <PriorityOverflowRow.Group>
    <strong>Design Review</strong>
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
          <ToolbarButton mode={mode} icon={<Comment />} label="Comments" />
          <ToolbarButton mode={mode} icon={<Share />} label="Share" />
        </>
      )}
    </PriorityOverflowRow.Variant>

    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'icon', priority: 35 },
      ] as const}
    >
      {(mode) => <DownloadButton mode={mode} />}
    </PriorityOverflowRow.Variant>
  </PriorityOverflowRow.Group>
</PriorityOverflowRow>
```

Behavior:

- Download compacts before the main toolbar actions become icon-only.
- The action group wraps at priority `90`.
- Once wrapped, it re-expands according to the new line width.
