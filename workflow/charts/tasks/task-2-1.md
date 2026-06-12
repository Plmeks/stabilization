# Task 2-1: Create CFD Chart Component

## Description
Create `src/components/stats/charts/CFDChart.tsx` — a Recharts `ComposedChart` displaying three stacked areas (Готовые, Критичные, Некритичные) and a dashed blue WIP line overlay.

## Changes Required

### New Files
- `src/components/stats/charts/CFDChart.tsx` — the CFD chart component

### Modified Files
- none

## Implementation Details

### Component: `CFDChart`

**File directive:** `'use client'` at the top.

**Props interface:**
```
interface CFDChartProps {
  data: ChartDataPoint[];
}
```
Import `ChartDataPoint` from `'@/lib/chart-utils'`.

**Recharts structure** (use granular named imports from `'recharts'`):
- Outer wrapper: `<ResponsiveContainer width="100%" height={350}>`
- Root chart: `<ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>`
- Inside `ComposedChart`:
  - `<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />`
  - `<XAxis dataKey="label" tick={{ fontSize: 12 }} />`
  - `<YAxis tick={{ fontSize: 12 }} />`
  - `<Tooltip />`
  - `<Legend />`
  - `<Area type="monotone" dataKey="completed_cumulative" name="Готовые" stackId="cfd" fill="#22c55e" stroke="#16a34a" fillOpacity={0.7} />`
  - `<Area type="monotone" dataKey="uncompleted_critical" name="Критичные" stackId="cfd" fill="#f87171" stroke="#dc2626" fillOpacity={0.7} />`
  - `<Area type="monotone" dataKey="uncompleted_non_critical" name="Некритичные" stackId="cfd" fill="#fb923c" stroke="#ea580c" fillOpacity={0.7} />`
  - `<Line type="monotone" dataKey="wip_total" name="WIP" stroke="#3b82f6" strokeDasharray="5 5" dot={false} strokeWidth={2} />`

**Wrapper layout** — render the chart inside a `<div>` with:
- A `<p>` or `<h3>` with text `"CFD с линией WIP"` and Tailwind classes `text-sm font-semibold text-foreground mb-3`
- The `<ResponsiveContainer>` below the title

**Stacking order note:** Recharts stacks `<Area>` elements in the order they appear in JSX with matching `stackId`. Render `completed_cumulative` first (bottom), `uncompleted_critical` second, `uncompleted_non_critical` third (top). This is correct as per TS §6.4 decision 2.

**Empty state:** If `data.length === 0`, render `null` (the parent `ChartsSection` handles the no-data case).

## Dependencies
- Depends on: task-1-1 (recharts installed), task-1-2 (ChartDataPoint type)

## Acceptance Criteria
- [ ] Component file created with `'use client'` directive
- [ ] Three stacked areas rendered with correct colors: green (#22c55e), red (#f87171), orange (#fb923c)
- [ ] WIP dashed blue line overlays the areas
- [ ] Areas stack in the correct order: Готовые (bottom) → Критичные → Некритичные (top)
- [ ] Chart title "CFD с линией WIP" is visible above the chart
- [ ] Legend identifies all four series
- [ ] Wrapped in `ResponsiveContainer` for responsive behavior
- [ ] No TypeScript errors

## Complexity
Medium
