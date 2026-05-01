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
        <ResizableFrame example="workspace-header" initialWidth={980}>
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
                Item 4821
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
      ? ['Workspace', 'Projects', 'Roadmap', 'Item 4821']
      : ['W', 'P', 'R', '4821'];

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

function People({ spacing }: { spacing: 'comfortable' | 'tight' }) {
  return (
    <div className={`people people-${spacing}`}>
      <span>AM</span>
      <span>JL</span>
      <span>RK</span>
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
      <Chip tone="blue" icon="PL" label={label('Planning', 'Plan')} />
      <Chip tone="gold" icon="DS" label={label('Design', 'Dsgn')} />
      <Chip icon="RV" label={label('Review', 'Rev')} />
      <Chip icon="AP" label={label('Approved', 'Appr')} />
      <Chip icon="BL" label={label('Blocked', 'Blkd')} />
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
      <ActionButton mode={mode} icon="E" label="Export" />
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
