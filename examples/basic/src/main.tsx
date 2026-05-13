import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PriorityOverflowRow } from '../../../src';
import type { ReactNode } from 'react';
import './styles.css';

type FilterMode = 'full' | 'short' | 'icon';
type ActionMode = 'full' | 'icon';

function App() {
  return (
    <main>
      <header className="page-header">
        <p className="eyebrow">react-priority-overflow-row</p>
        <h1>Priority-based responsive rows</h1>
        <p>
          Resize each frame. Children compact by priority first, groups wrap
          only when compaction is exhausted, and wrapped lines solve themselves
          independently.
        </p>
      </header>

      <section className="demo-section">
        <h2>Workspace Header</h2>
        <ResizableFrame example="workspace-header" initialWidth={760}>
          <PriorityOverflowRow gap={12} className="workspace-header">
            <PriorityOverflowRow.Group gap={10}>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'compact', priority: 10 },
                  ] as const
                }
              >
                {(mode) => <Breadcrumbs mode={mode} />}
              </PriorityOverflowRow.Variant>
              <a className="entity-chip" href="#item">
                Project Atlas
              </a>
            </PriorityOverflowRow.Group>

            <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={100}>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'comfortable' },
                    { value: 'tight', priority: 30 },
                  ] as const
                }
              >
                {(spacing) => <People spacing={spacing} />}
              </PriorityOverflowRow.Variant>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'short', priority: 20 },
                    { value: 'icon', priority: 80 },
                  ] as const
                }
              >
                {(mode) => <FilterChips mode={mode} />}
              </PriorityOverflowRow.Variant>
              <div className="divider" />
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'icon', priority: 40 },
                  ] as const
                }
              >
                {(mode) => <Actions mode={mode} />}
              </PriorityOverflowRow.Variant>
            </PriorityOverflowRow.Group>
          </PriorityOverflowRow>
        </ResizableFrame>
      </section>

      <section className="demo-section">
        <h2>Adaptive Toolbar</h2>
        <ResizableFrame example="toolbar" initialWidth={760}>
          <PriorityOverflowRow gap={10} className="toolbar">
            <PriorityOverflowRow.Group>
              <strong className="title">Design Review</strong>
            </PriorityOverflowRow.Group>
            <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={90}>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'short', priority: 20 },
                    { value: 'icon', priority: 60 },
                  ] as const
                }
              >
                {(mode) => (
                  <>
                    <ToolButton mode={mode} icon="R" label="Refresh" />
                    <ToolButton mode={mode} icon="C" label="Comments" />
                    <ToolButton mode={mode} icon="S" label="Share" />
                  </>
                )}
              </PriorityOverflowRow.Variant>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'icon', priority: 35 },
                  ] as const
                }
              >
                {(mode) => <ToolButton mode={mode} icon="D" label="Download" />}
              </PriorityOverflowRow.Variant>
            </PriorityOverflowRow.Group>
          </PriorityOverflowRow>
        </ResizableFrame>
      </section>

      <section className="demo-section">
        <h2>Split Right Side</h2>
        <ResizableFrame example="split-right-side" initialWidth={760}>
          <PriorityOverflowRow gap={12} className="split-header">
            <PriorityOverflowRow.Group gap={10}>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'compact', priority: 10 },
                  ] as const
                }
              >
                {(mode) => <DocumentTrail mode={mode} />}
              </PriorityOverflowRow.Variant>
              <a className="entity-chip" href="#review">
                Review pack
              </a>
            </PriorityOverflowRow.Group>

            <PriorityOverflowRow.Group align="end" gap={8} wrapPriority={90}>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'comfortable' },
                    { value: 'tight', priority: 30 },
                  ] as const
                }
              >
                {(spacing) => <People spacing={spacing} />}
              </PriorityOverflowRow.Variant>
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'short', priority: 20 },
                    { value: 'icon', priority: 80 },
                  ] as const
                }
              >
                {(mode) => <StateChips mode={mode} />}
              </PriorityOverflowRow.Variant>
            </PriorityOverflowRow.Group>

            <PriorityOverflowRow.Group align="end" gap={8}>
              <div className="divider" />
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'icon', priority: 40 },
                  ] as const
                }
              >
                {(mode) => (
                  <div className="actions">
                    <ActionButton mode={mode} icon="S" label="Share" />
                    <ActionButton mode={mode} icon="E" label="Export" />
                  </div>
                )}
              </PriorityOverflowRow.Variant>
            </PriorityOverflowRow.Group>
          </PriorityOverflowRow>
        </ResizableFrame>
      </section>

      <section className="demo-section">
        <h2>Packed Schedule Bar</h2>
        <ResizableFrame example="packed-schedule-bar" initialWidth={820}>
          <PriorityOverflowRow
            layout="packed"
            gap={12}
            className="packed-schedule-bar"
          >
            <PriorityOverflowRow.Group>
              <DateField icon="▶" label="Kickoff" value="2026-04-06" />
            </PriorityOverflowRow.Group>
            <PriorityOverflowRow.Group>
              <DateField icon="▣" label="Internal Review" value="2026-04-13" />
            </PriorityOverflowRow.Group>
            <PriorityOverflowRow.Group>
              <DateField icon="◼" label="Launch Window" value="2026-04-20" />
            </PriorityOverflowRow.Group>
            <PriorityOverflowRow.Group>
              <a className="resource-link" href="#resource">
                ⬡ Assets ready
              </a>
            </PriorityOverflowRow.Group>
            <PriorityOverflowRow.Group align="end">
              <PriorityOverflowRow.Variant
                modes={
                  [
                    { value: 'full' },
                    { value: 'short', priority: 40 },
                    { value: 'icon', priority: 80 },
                  ] as const
                }
              >
                {(mode) => <WorkflowButtons mode={mode} />}
              </PriorityOverflowRow.Variant>
            </PriorityOverflowRow.Group>
          </PriorityOverflowRow>
        </ResizableFrame>
      </section>
    </main>
  );
}

function ResizableFrame({
  children,
  example,
  initialWidth = 960,
}: {
  children: ReactNode;
  example: string;
  initialWidth?: number;
}) {
  return (
    <div
      className="resize-shell"
      data-example={example}
      style={{ width: initialWidth }}
    >
      {children}
    </div>
  );
}

function Breadcrumbs({ mode }: { mode: 'full' | 'compact' }) {
  const items =
    mode === 'full'
      ? ['Tasks', 'T-4821']
      : ['T', '4821'];

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item} className={index === items.length - 1 ? 'muted' : ''}>
          {item}
        </span>
      ))}
    </nav>
  );
}

function DocumentTrail({ mode }: { mode: 'full' | 'compact' }) {
  const items =
    mode === 'full'
      ? ['Library', 'Design Systems', 'Buttons']
      : ['L', 'DS', 'Buttons'];

  return (
    <nav className="breadcrumbs" aria-label="Document trail">
      {items.map((item, index) => (
        <span key={item} className={index === items.length - 1 ? 'muted' : ''}>
          {item}
        </span>
      ))}
    </nav>
  );
}

function People({ spacing }: { spacing: 'comfortable' | 'tight' }) {
  return (
    <div className={`people people-${spacing}`}>
      <span>AM</span>
      <span>JL</span>
    </div>
  );
}

function FilterChips({ mode }: { mode: FilterMode }) {
  const label = (full: string, short: string) => {
    if (mode === 'icon') {
      return null;
    }

    return mode === 'short' ? short : full;
  };

  return (
    <div className="chips">
      <Chip tone="blue" icon="TD" label={label('Todo', 'Todo')} />
      <Chip tone="gold" icon="RV" label={label('Review', 'Rev')} />
    </div>
  );
}

function StateChips({ mode }: { mode: FilterMode }) {
  const label = (full: string, short: string) => {
    if (mode === 'icon') {
      return null;
    }

    return mode === 'short' ? short : full;
  };

  return (
    <div className="chips">
      <Chip tone="blue" icon="ST" label={label('Staged', 'Stg')} />
      <Chip tone="gold" icon="QA" label={label('Quality Check', 'QA')} />
      <Chip icon="AP" label={label('Approved', 'Appr')} />
    </div>
  );
}

function Chip({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string | null;
  tone?: 'blue' | 'gold';
}) {
  return (
    <span className={`chip ${tone ? `chip-${tone}` : ''}`}>
      <span className="chip-icon">{icon}</span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}

function Actions({ mode }: { mode: ActionMode }) {
  return (
    <div className="actions">
      <ActionButton mode={mode} icon="O" label="Open" />
    </div>
  );
}

function ActionButton({
  mode,
  icon,
  label,
}: {
  mode: ActionMode;
  icon: string;
  label: string;
}) {
  return (
    <button className="action-button">
      <span>{icon}</span>
      {mode === 'full' ? label : null}
    </button>
  );
}

function ToolButton({
  mode,
  icon,
  label,
}: {
  mode: 'full' | 'short' | 'icon';
  icon: string;
  label: string;
}) {
  const text = mode === 'icon' ? null : mode === 'short' ? label[0] : label;

  return (
    <button className="tool-button">
      <span>{icon}</span>
      {text ? <span>{text}</span> : null}
    </button>
  );
}

function DateField({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <label className="date-field">
      <span>{label}</span>
      <strong>
        <span>{icon}</span>
        {value}
        <span>▣</span>
      </strong>
    </label>
  );
}

function WorkflowButtons({ mode }: { mode: FilterMode }) {
  return (
    <div className="workflow-buttons">
      <WorkflowButton
        mode={mode}
        icon="☑"
        label="Requirements Review"
        shortLabel="Req."
        count={0}
      />
      <WorkflowButton
        mode={mode}
        icon="◉"
        label="Prototype Check"
        shortLabel="Proto"
        count={0}
      />
      <WorkflowButton
        mode={mode}
        icon="▤"
        label="Release Notes"
        shortLabel="Notes"
        count={1}
      />
    </div>
  );
}

function WorkflowButton({
  count,
  icon,
  label,
  mode,
  shortLabel,
}: {
  count: number;
  icon: string;
  label: string;
  mode: FilterMode;
  shortLabel: string;
}) {
  const text = mode === 'icon' ? null : mode === 'short' ? shortLabel : label;

  return (
    <a
      className={`workflow-button ${mode === 'icon' ? 'workflow-button-icon' : ''}`}
      href="#workflow"
      aria-label={label}
    >
      <span>{icon}</span>
      {text ? <span>{text}</span> : null}
      {mode === 'icon' ? (
        <span className="workflow-button-badge">{count}</span>
      ) : (
        <span className="workflow-button-count">{count}</span>
      )}
    </a>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
