# Task 3.2: PeriodAccordion

## Related Use Cases
- UC-1: Create Period
- UC-11: Collapse/Expand Periods

## Goal
Build a collapsible container for a period section with header (date range + counters + chevron) and animated content area.

## Changes

### New Files

#### `src/components/shared/PeriodAccordion.tsx`
- Client component
- Props:
  - `period: Period`
  - `isExpanded: boolean`
  - `onToggle: () => void`
  - `taskCount: number` — total tasks in this period
  - `children: React.ReactNode` — the tasks list
  - `headerActions?: React.ReactNode` — slot for delete button etc.
- Structure:
  - **Header row** (always visible, clickable):
    - Chevron icon (rotates 180° when expanded) — click triggers `onToggle`
    - Period date range formatted as "DD.MM - DD.MM.YYYY" (use `formatPeriodLabel`)
    - Badge showing task count: "Всего: N"
    - `headerActions` slot (right-aligned)
  - **Collapsible body**: shown when `isExpanded`, wraps `children`
  - Animate open/close with CSS `transition` on `max-height` or Tailwind `data-[state=open]` pattern

## Notes
- Expansion state is managed externally via `expandedPeriodsAtom`; this component is purely presentational
- The chevron icon: use `ChevronDown` from `lucide-react`
- No animation library needed — pure CSS transition is sufficient
