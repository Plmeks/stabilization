# Task 2-2: Create Reusable BacklogChart Component

## Description
Create `src/components/stats/charts/BacklogChart.tsx` — a parameterized `LineChart` component used for both the critical and non-critical cumulative backlog charts. Parameterized by `dataKey`, `color`, and `title` so it serves both UC-2 and UC-3 without duplication.

## Changes Required

### New Files
- `src/components/stats/charts/BacklogChart.tsx` — reusable backlog line chart

### Modified Files
- none

## Implementation Details

### Component: `BacklogChart`

**File directive:** `'use client'` at the top.

**Props interface:**
```
interface BacklogChartProps {
  data: ChartDataPoint[];
  dataKey: 'uncompleted_critical' | 'uncompleted_non_critical';
  color: string;
  title: string;
}
```
Import `ChartDataPoint` from `'@/lib/chart-utils'`.

**Recharts structure** (use granular named imports from `'recharts'`):
- Outer wrapper: `<ResponsiveContainer width="100%" height={250}>`
- Root chart: `<LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>`
- Inside `LineChart`:
  - `<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />`
  - `<XAxis dataKey="label" tick={{ fontSize: 12 }} />`
  - `<YAxis label={{ value: 'Остаток', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} tick={{ fontSize: 12 }} />`
  - `<Tooltip />`
  - `<Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />`

**Wrapper layout:**
- A `<div>` containing:
  - A `<p>` or `<h3>` with `{title}` and Tailwind classes `text-sm font-semibold text-foreground mb-3`
  - The `<ResponsiveContainer>` below

**Empty state:** If `data.length === 0`, render `null`.

### Usage in ChartsSection (for reference):
```
<BacklogChart
  data={chartData}
  dataKey="uncompleted_critical"
  color="#f87171"
  title="Кумулятивный остаток критичных тикетов"
/>
<BacklogChart
  data={chartData}
  dataKey="uncompleted_non_critical"
  color="#fb923c"
  title="Кумулятивный остаток некритичных тикетов"
/>
```

## Dependencies
- Depends on: task-1-1 (recharts installed), task-1-2 (ChartDataPoint type)

## Acceptance Criteria
- [ ] Component file created with `'use client'` directive
- [ ] Accepts `dataKey`, `color`, and `title` as props
- [ ] Line rendered with the specified `color` and dot markers (r=4)
- [ ] Y-axis labeled "Остаток"
- [ ] Title rendered above the chart
- [ ] Wrapped in `ResponsiveContainer` (height 250)
- [ ] No TypeScript errors

## Complexity
Simple
