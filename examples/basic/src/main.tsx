import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PriorityOverflowRow } from '../../../src';
import type { ReactNode } from 'react';
import './styles.css';

type ChipMode = 'full' | 'short' | 'icon';
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
        <h2>Job Header Pattern</h2>
        <ResizableFrame>
          <PriorityOverflowRow gap={12} className="job-header">
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
              <a className="quote-chip" href="#quote">
                173603
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
                {(mode) => <JobChips mode={mode} />}
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
        <h2>Toolbar Pattern</h2>
        <ResizableFrame initialWidth={760}>
          <PriorityOverflowRow gap={10} className="toolbar">
            <PriorityOverflowRow.Group>
              <strong className="title">Quote 173603</strong>
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
                    <ToolButton mode={mode} icon="P" label="Print preview" />
                    <ToolButton mode={mode} icon="A" label="Approval drawing" />
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
                {(mode) => <ToolButton mode={mode} icon="S" label="Save" />}
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
  initialWidth = 960,
}: {
  children: ReactNode;
  initialWidth?: number;
}) {
  return (
    <div className="resize-shell" style={{ width: initialWidth }}>
      {children}
    </div>
  );
}

function Breadcrumbs({ mode }: { mode: 'full' | 'compact' }) {
  const items =
    mode === 'full'
      ? ['Home', 'Production', 'Jobs', '67194-0']
      : ['H', 'P', 'J', '67194-0'];

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
      <span>EC</span>
      <span>SS</span>
      <span>MB</span>
    </div>
  );
}

function JobChips({ mode }: { mode: ChipMode }) {
  const label = (full: string, short: string) => {
    if (mode === 'icon') {
      return null;
    }

    return mode === 'short' ? short : full;
  };

  return (
    <div className="chips">
      <Chip tone="blue" icon="PK" label={label('Packages', 'Pkg')} />
      <Chip tone="gold" icon="WD" label={label('Welding', 'Weld')} />
      <Chip icon="PI" label={label('Picking', 'Pick')} />
      <Chip icon="PR" label={label('Production', 'Prod')} />
      <Chip icon="BO" label={label('Backorder', 'B/O')} />
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
      <ActionButton mode={mode} icon="B" label="BOM" />
      <ActionButton mode={mode} icon="S" label="Save" disabled />
    </div>
  );
}

function ActionButton({
  mode,
  icon,
  label,
  disabled = false,
}: {
  mode: ActionMode;
  icon: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button className="action-button" disabled={disabled}>
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
