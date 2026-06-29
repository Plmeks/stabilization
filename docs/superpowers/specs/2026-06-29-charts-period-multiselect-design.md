# Charts: flexible period multi-select

**Date:** 2026-06-29
**Status:** Approved (design)

## Problem

On the Графики (charts) page the period filter is a single native `<select>`.
Picking a period means "from the oldest period up to the one you picked"
(`allChartData.slice(0, selectedIndex + 1)`). You can only ever choose a
contiguous range anchored at the oldest period — you cannot drop the oldest,
exclude a noisy middle period, or look at an arbitrary subset.

We want to choose **exactly which periods feed the charts** via checkboxes, and
add/remove any period freely.

## Key insight: points are self-contained

`calculateChartData` produces one `ChartDataPoint` per period, and each point
already carries its **cumulative** value (e.g. `completed_cumulative`,
`uncompleted_critical`, `total_problems_cumulative`) computed up to that period.
The cumulative math is baked into each point — it does **not** depend on which
other points are rendered.

Therefore "include an arbitrary subset of periods" is a pure **view filter**:
show only the checked points; each keeps its real value. No recomputation.

This was confirmed as the desired behaviour: unchecking a middle period just
hides its point — the remaining points keep their true cumulative numbers (so a
later period still counts the hidden period's tickets in its totals). This keeps
the charts consistent with the report and the tables. The alternative
(recompute cumulative over only the selected periods) was explicitly rejected.

## Behaviour

- The selection applies to **all three charts** at once: CFD + the two backlog
  charts (critical / non-critical cumulative remainder).
- Charts plot the selected points in chronological order (oldest → newest). An
  excluded middle period leaves a gap that the line bridges; values never change.
- **Default on load: all periods selected** (matches today's default, which
  shows everything).
- A **newly created period is selected by default** (it appears in the charts
  without extra action). A deleted period drops out of the selection.
- **User deselections persist** across period-list changes — only genuinely new
  ids are auto-added; ids that vanish are removed.
- **Empty selection** (nothing checked) → charts area shows a quiet hint
  `Выберите хотя бы один период`, not a broken axis.
- Selection lives in page state only (resets on reload). No persistence — same
  as the current behaviour.

## The control

Replaces the native `<select>`. A Popover dropdown with a checkbox per period,
following the existing `AssigneeMultiSelect` pattern (Radix Popover + a
foreground-filled checkbox square with a `Check` icon, `hover:bg-muted` rows).

### Trigger (closed) — "N из M · диапазон"

The field shows the count of selected periods plus the date span of the
selection:

- `N из M` — count in `var(--foreground)`, `font-medium`. Honestly signals when
  a subset is selected (e.g. `5 из 7`).
- A `·` separator in `var(--border)`.
- The span — `DD.MM.YYYY – DD.MM.YYYY` from the **earliest selected start** to
  the **latest selected end**, in `var(--muted-foreground)`, truncating if long.
- A trailing chevron, consistent with other selects.

States:
- All selected → `15 из 15 · 01.01.2026 – 05.07.2026`.
- Subset → `5 из 7 · 04.05.2026 – 21.06.2026` (count makes the subset explicit;
  the span shows the outer bounds).
- One selected → `1 из 15 · 22.06.2026 – 28.06.2026` (the span is that period).
- None selected → muted placeholder `Не выбрано`.

Note: with a gappy selection the span reads as the outer bounds, not a
continuous range — the `N из M` count is what signals "not all of them." The
exact per-period picture lives one click away in the open panel.

(An earlier draft used a segmented "period ribbon" here; replaced with this
text treatment per review — the ribbon read as visual noise in the field.)

### Open panel

- Header row: `Выбрано 5 из 7` on the left; a single toggle button on the right
  that reads `Снять всё` when anything is selected and `Выбрать всё` when none
  is. (When all are selected it still offers `Снять всё`.)
- Period rows, **newest first** (matching the QA/Completed pages), each a
  checkbox + the full period label `DD.MM.YYYY – DD.MM.YYYY`.
- Scrolls when tall (`max-h-60`, like the assignee list).

## Components and data

### New: `src/components/shared/PeriodMultiSelect.tsx`

Self-contained, reusable. Props:

```ts
interface PeriodMultiSelectProps {
  periods: Period[];          // unsorted; component derives both orderings
  value: string[];            // selected period ids
  onChange: (ids: string[]) => void;
}
```

Responsibilities: render the ribbon trigger, render the checkbox panel (newest
first), handle toggle / select-all / clear-all. Pure presentational + selection
logic; no data fetching. Ribbon order is oldest → newest; list order is newest
→ oldest; both derived internally from `periods`.

### Changed: `src/lib/chart-utils.ts`

Add `periodId: string` to `ChartDataPoint` so the section can filter points by
id without re-zipping against the period list. Populate it in
`calculateChartData` (the period is already in scope).

### Changed: `src/components/stats/charts/ChartsSection.tsx`

- Replace `selectedPeriodId: string` + the `slice(0, index + 1)` logic with
  `selectedIds: string[]` (or a `Set<string>`).
- Reconcile selection against `periods` in an effect: initialise to all ids;
  add brand-new ids; drop ids no longer present; preserve user deselections
  (track previously-known ids in a ref).
- `chartData = allChartData.filter(p => selectedSet.has(p.periodId))`, preserving
  chronological order (allChartData is already oldest → newest).
- Render `<PeriodMultiSelect>` in place of the `<label> + <select>`.
- If `chartData.length === 0`, render the empty hint instead of the charts.
- Keep the existing `Масштабировать по диапазону данных` checkbox unchanged.

## Out of scope (YAGNI)

- Persisting the selection across reloads.
- A "select contiguous range" helper (the old range model is what we're
  replacing; checkboxes + select-all/clear-all cover it).
- Recomputing cumulative values over the selected subset.
- Per-period colour coding inside the ribbon.

## Quality floor

- Full keyboard access (Popover focus management, checkboxes toggle via the
  list buttons as in `AssigneeMultiSelect`); visible focus ring.
- Responsive: the field is full-width on mobile; the panel matches trigger
  width; rows are comfortably tappable.
- Respect `prefers-reduced-motion` (no custom animation introduced anyway).
