# Task 3.1: Stats Page + StatsPeriodCard + LockMetricsButton + DataLoader

## Related Use Cases
- UC-6: Show dynamic metrics for unlocked period; lock button saves to period_statistics
- UC-7: Show "Редактировать" button when period has a statistics record

## Task Goal

Replace the date-range-based metrics computation in the stats page with period_id-based logic. Connect `StatsPeriodCard` to the new `periodStatisticsAtom`. Update `LockMetricsButton` to use `lockPeriodMetricsAtom`. Update `DataLoader` to also fetch `period_statistics` on startup.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/layout/DataLoader.tsx`

- Import `fetchPeriodStatisticsAtom` from `@/atoms/statsAtom`
- Call `fetchPeriodStatisticsAtom()` inside the `useEffect`, in parallel with `fetchTasks()` and `fetchPeriods()`

#### File: `src/app/stats/page.tsx`

**Complete rewrite of the component logic**:

- Import `periodStatisticsAtom`, `lockPeriodMetricsAtom` from `@/atoms/statsAtom`
- Import `tasksAtom` from `@/atoms/tasksAtom` (replaces the dayjs-based computation)
- Remove `dayjs` and `isBetween` imports — no longer needed
- For each period, compute dynamic metrics by filtering `tasks` where `task.period_id === period.id`:
  - `dynamicAddedToBacklog`: count tasks with `status !== null`
  - `dynamicAddedCritical`: count tasks with `status !== null && priority === 'Авария'`
  - `dynamicResolvedTotal`: count tasks with `status === 'Завершена'`
  - `dynamicResolvedCritical`: count tasks with `status === 'Завершена' && priority === 'Авария'`
  - `dynamicInProgress`: count tasks with `status === 'В работе'`
  - `dynamicInTesting`: count tasks with `status === 'В тесте'`
- Look up `statistics` for each period: find the `PeriodStatistics` record from `periodStatisticsAtom` where `statistics.period_id === period.id`
- Pass both `statistics` (may be `null`) and all 6 dynamic metric values to `StatsPeriodCard`
- Remove the `addedToBacklog`, `addedCritical`, `resolvedTotal`, `resolvedCritical` props that were computed via date range

#### File: `src/components/stats/StatsPeriodCard.tsx`

**Update component props interface**:
```
interface StatsPeriodCardProps {
  period: Period;
  statistics: PeriodStatistics | null;
  dynamicAddedToBacklog: number;
  dynamicAddedCritical: number;
  dynamicResolvedTotal: number;
  dynamicResolvedCritical: number;
  dynamicInProgress: number;
  dynamicInTesting: number;
}
```

**Update component rendering logic**:
- `isLocked`: derive from `statistics !== null` (previously from `period.metrics_snapshot !== null`)
- When `isLocked = false` (unlocked period):
  - Display all 6 metrics using dynamic values
  - Show `LockMetricsButton` at the bottom
- When `isLocked = true` (locked period):
  - Display all 6 metrics using values from `statistics` object (e.g., `statistics.added_to_backlog`)
  - Show locked timestamp: `statistics.locked_at`
  - Show "Редактировать" button (pencil icon, `variant="ghost" size="icon"`)
  - The edit button should call an `onEdit?: () => void` prop (wired up in task 3.2)
- All 6 metrics should always be visible (not split into two sections as in old code)
- Remove reliance on `period.metrics_snapshot` and `period.metrics_locked_at`

#### File: `src/components/stats/LockMetricsButton.tsx`

- Change the atom from `lockMetricsAtom` (deleted) to `lockPeriodMetricsAtom` from `@/atoms/statsAtom`
- The click handler calls `await lockMetrics(periodId)` → same pattern, just different atom
- Keep the loading state logic as-is
- Update imports accordingly

## Acceptance Criteria
- [ ] `DataLoader` fetches `period_statistics` on mount
- [ ] Stats page computes metrics by `period_id` (not date range)
- [ ] `StatsPeriodCard` uses `statistics` prop instead of `period.metrics_snapshot`
- [ ] Unlocked period shows dynamic metrics + LockMetricsButton
- [ ] Locked period shows 6 metrics from `period_statistics` + locked_at timestamp + edit button placeholder
- [ ] `LockMetricsButton` uses `lockPeriodMetricsAtom`
- [ ] No `dayjs.isBetween` usage remains in stats page
- [ ] TypeScript compilation passes

## Notes

- The "Редактировать" button's `onClick` is an `onEdit` prop. In this task, pass a no-op or leave it for task 3.2 to wire up — just render the button so the UI is complete.
- The `formatPeriodLabel` utility is still used for the period header — keep that import.
- `dayjs` may still be needed in `StatsPeriodCard` for formatting `statistics.locked_at` — keep it if so, just remove the `isBetween` plugin import from stats page.
