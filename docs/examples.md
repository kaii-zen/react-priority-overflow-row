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

## Split Right Side

Use separate end-aligned groups when one right-side cluster can wrap but another
cluster should remain on the first line.

```tsx
<PriorityOverflowRow gap={12}>
  <PriorityOverflowRow.Group gap={10}>
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'compact', priority: 10 },
      ] as const}
    >
      {(mode) => <DocumentTrail mode={mode} />}
    </PriorityOverflowRow.Variant>
    <ReviewPackBadge />
  </PriorityOverflowRow.Group>

  <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={90}>
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'comfortable' },
        { value: 'tight', priority: 30 },
      ] as const}
    >
      {(spacing) => <Collaborators spacing={spacing} />}
    </PriorityOverflowRow.Variant>

    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'short', priority: 20 },
        { value: 'icon', priority: 80 },
      ] as const}
    >
      {(mode) => <StateChips mode={mode} />}
    </PriorityOverflowRow.Variant>
  </PriorityOverflowRow.Group>

  <PriorityOverflowRow.Group align="end" gap={8}>
    <Divider />
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'icon', priority: 40 },
      ] as const}
    >
      {(mode) => (
        <>
          <ShareButton mode={mode} />
          <ExportButton mode={mode} />
        </>
      )}
    </PriorityOverflowRow.Variant>
  </PriorityOverflowRow.Group>
</PriorityOverflowRow>
```

Behavior:

- Adjacent `align="end"` groups stay clustered against the right edge.
- The actions group remains on the first line because it has no `wrapPriority`.
- The collaborators and state chips can wrap to their own line at priority `90`.
- Once wrapped, the collaborators and state chips are solved independently and
  stay end-aligned on the new line.

## Packed Info Bar

Use `layout="packed"` when every group should keep source order but later groups
may fill leftover space on wrapped lines.

```tsx
<PriorityOverflowRow layout="packed" gap={12}>
  <PriorityOverflowRow.Group>
    <DateField label="Start" />
  </PriorityOverflowRow.Group>
  <PriorityOverflowRow.Group>
    <DateField label="Delivery" />
  </PriorityOverflowRow.Group>
  <PriorityOverflowRow.Group>
    <DrawingStatus />
  </PriorityOverflowRow.Group>
  <PriorityOverflowRow.Group align="end">
    <PriorityOverflowRow.Variant
      modes={[
        { value: 'full' },
        { value: 'short', priority: 20 },
        { value: 'icon', priority: 80 },
      ] as const}
    >
      {(mode) => (
        <>
          <FormButton mode={mode} icon={<Clipboard />} label="Inspection" />
          <FormButton mode={mode} icon={<Gauge />} label="Test Report" />
          <FormButton mode={mode} icon={<Wrench />} label="Service" />
        </>
      )}
    </PriorityOverflowRow.Variant>
  </PriorityOverflowRow.Group>
</PriorityOverflowRow>
```

Behavior:

- Date and drawing groups wrap individually.
- The form buttons compact before their group wraps when that is cheaper.
- Once a new line exists, later groups are packed into it when they fit.
- The end-aligned forms group stays pinned to the right side of its line.
