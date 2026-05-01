import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import PriorityOverflowRow from './PriorityOverflowRow';

const rect = (width: number): DOMRect => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: width,
  top: 0,
  width,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

function visibleSlot(slot: string) {
  return Array.from(document.querySelectorAll(`[data-slot="${slot}"]`)).find(
    (element) => !element.closest('[aria-hidden="true"]'),
  ) as HTMLElement | undefined;
}

function TestRow() {
  return (
    <PriorityOverflowRow gap="12px" className="priority-row">
      <PriorityOverflowRow.Group>
        <PriorityOverflowRow.Variant
          modes={
            [{ value: 'full' }, { value: 'compact', priority: 10 }] as const
          }
        >
          {(mode) => <span data-slot="left">left-{mode}</span>}
        </PriorityOverflowRow.Variant>
        <span>badge</span>
      </PriorityOverflowRow.Group>
      <PriorityOverflowRow.Group align="end" wrapPriority={100}>
        <PriorityOverflowRow.Variant
          modes={
            [{ value: 'medium' }, { value: 'small', priority: 30 }] as const
          }
        >
          {(mode) => <span data-slot="people">people-{mode}</span>}
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
          {(mode) => <span data-slot="chips">chips-{mode}</span>}
        </PriorityOverflowRow.Variant>
        <PriorityOverflowRow.Variant
          modes={[{ value: 'full' }, { value: 'icon', priority: 40 }] as const}
        >
          {(mode) => <span data-slot="actions">actions-{mode}</span>}
        </PriorityOverflowRow.Variant>
      </PriorityOverflowRow.Group>
    </PriorityOverflowRow>
  );
}

describe('PriorityOverflowRow', () => {
  let availableWidth = 940;
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    availableWidth = 940;
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    HTMLElement.prototype.getBoundingClientRect =
      function getBoundingClientRect() {
        const element = this as HTMLElement;
        const widthByText: Record<string, number> = {
          'left-fullbadge': 300,
          'left-compactbadge': 180,
          'people-mediumchips-fullactions-full': 420,
          'people-mediumchips-shortactions-full': 360,
          'people-smallchips-shortactions-full': 340,
          'people-smallchips-shortactions-icon': 300,
          'people-smallchips-iconactions-icon': 260,
        };

        if (element.classList.contains('priority-row')) {
          return rect(availableWidth);
        }

        if (element.textContent && widthByText[element.textContent]) {
          return rect(widthByText[element.textContent]);
        }

        if (
          element.tagName === 'SPAN' &&
          element.textContent === '' &&
          element.children.length === 2
        ) {
          return rect(12);
        }

        return originalGetBoundingClientRect.call(this);
      };
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    cleanup();
  });

  it('renders fixed children and selected variant modes', async () => {
    render(<TestRow />);

    await waitFor(() => {
      expect(visibleSlot('left')).toHaveTextContent('left-full');
      expect(visibleSlot('chips')).toHaveTextContent('chips-full');
      expect(screen.getAllByText('badge').length).toBeGreaterThan(0);
    });
  });

  it('pins end-aligned groups to the right of their line', async () => {
    render(<TestRow />);

    await waitFor(() => {
      expect(visibleSlot('chips')?.parentElement?.style.marginInlineStart).toBe(
        'auto',
      );
    });
  });

  it('uses configured priorities to select child modes', async () => {
    availableWidth = 500;
    render(<TestRow />);

    await waitFor(() => {
      expect(visibleSlot('left')).toHaveTextContent('left-compact');
      expect(visibleSlot('people')).toHaveTextContent('people-small');
      expect(visibleSlot('chips')).toHaveTextContent('chips-short');
      expect(visibleSlot('actions')).toHaveTextContent('actions-icon');
    });
  });

  it('wraps a group and re-solves that line from expansive modes', async () => {
    availableWidth = 430;
    render(<TestRow />);

    await waitFor(() => {
      expect(visibleSlot('left')).toHaveTextContent('left-full');
      expect(visibleSlot('people')).toHaveTextContent('people-medium');
      expect(visibleSlot('chips')).toHaveTextContent('chips-full');
      expect(visibleSlot('actions')).toHaveTextContent('actions-full');
    });
  });
});
