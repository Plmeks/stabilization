# Task 5.4: Statistics Tab Page

## Related Use Cases
- UC-7: View & Lock Stats

## Goal
Build the "Статистика" tab — list of periods with computed and locked metrics.

## Changes

### Modified Files

#### `src/app/stats/page.tsx`
- Client component
- Reads `periodsAtom`, `tasksAtom`
- For each period, computes dynamic metrics on the client:
  - **"Добавлено в беклог"**: count tasks where `created_at` falls within `[period.start_date, period.end_date]` (TS review fix)
  - **"Из них критических"**: same set filtered by `priority = 'Авария'`
  - **"Решено всего"**: count tasks where `completed_at` falls within period date range
  - **"Решено критических"**: same filtered by `priority = 'Авария'`
- For locked metrics (from `period.metrics_snapshot`): display saved values
- Layout: list of `StatsPeriodCard` components, newest first

### New Files

#### `src/components/stats/StatsPeriodCard.tsx`
- Props:
  - `period: Period`
  - `addedToBacklog: number`
  - `addedCritical: number`
  - `resolvedTotal: number`
  - `resolvedCritical: number`
- Renders a card with:
  - Header: period date range (using `formatPeriodLabel`)
  - Grid of `StatsMetricItem` components for each metric
  - `LockMetricsButton` if `period.metrics_snapshot === null`
  - If locked: show "В работе: N" and "В тесте: N" from `period.metrics_snapshot`; show locked timestamp

#### `src/components/stats/StatsMetricItem.tsx`
- Props: `label: string`, `value: number | string`
- Renders a simple label + value pair in a grid cell

#### `src/components/stats/LockMetricsButton.tsx`
- Props:
  - `periodId: string`
  - `loading?: boolean`
- Renders a "Зафиксировать метрики" button (outline variant)
- On click: calls `lockMetricsAtom(periodId)` write atom
- Shows loading spinner when `loading = true`

## Notes
- Date range check: `dayjs(task.created_at).isBetween(period.start_date, period.end_date, 'day', '[]')`
- Use `dayjs` plugin `isBetween` (or simple dayjs comparison)
- After locking, the button disappears and locked values display — handled reactively via `periodsAtom`
