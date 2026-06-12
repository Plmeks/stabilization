# Task 3.4: Stats Page Integration

## Related Use Cases
- UC-1: View Dynamic Statistics with Corrected "Добавлено" Logic
- UC-5: View Metrics in Grouped Layout

## Task Goal
Update `src/app/stats/page.tsx` to use the new `calculateDynamicMetrics` utility and pass a `dynamicMetrics` object to each `StatsPeriodCard`, replacing the old 6 individual dynamic props.

## Description of Changes

### Changes to Existing Files

#### File: `src/app/stats/page.tsx`

**1. Add import for `calculateDynamicMetrics`:**
```typescript
import { calculateDynamicMetrics } from '@/lib/stats-utils';
```

**2. Remove the inline dynamic metric calculations** — delete these 6 lines:
```typescript
const dynamicAddedToBacklog = periodTasks.filter((t) => t.status !== null).length;
const dynamicAddedCritical = periodTasks.filter((t) => t.status !== null && t.priority === 'Авария').length;
const dynamicResolvedTotal = periodTasks.filter((t) => t.status === 'Завершена').length;
const dynamicResolvedCritical = periodTasks.filter((t) => t.status === 'Завершена' && t.priority === 'Авария').length;
const dynamicInProgress = periodTasks.filter((t) => t.status === 'В работе').length;
const dynamicInTesting = periodTasks.filter((t) => t.status === 'В тесте').length;
```

**3. Replace with `calculateDynamicMetrics` call:**
```typescript
const dynamicMetrics = calculateDynamicMetrics(period, sortedPeriods, tasks);
```

Note: pass `sortedPeriods` (already computed) as `allPeriods`, and `tasks` (the full task atom value) as `allTasks`. The utility handles the cumulative filtering internally.

**4. Update `StatsPeriodCard` props:** Replace all 6 `dynamic*` props with the single `dynamicMetrics` prop:
```tsx
<StatsPeriodCard
  key={period.id}
  period={period}
  statistics={statistics}
  dynamicMetrics={dynamicMetrics}
/>
```

Remove: `dynamicAddedToBacklog`, `dynamicAddedCritical`, `dynamicResolvedTotal`, `dynamicResolvedCritical`, `dynamicInProgress`, `dynamicInTesting` from the JSX.

**5. Remove `periodTasks` variable** — it is no longer needed in the page component since `calculateDynamicMetrics` computes it internally.

**No other changes needed.** The `sortedPeriods` computation (using `dayjs` descending sort for display), the `periodsAtom`/`tasksAtom`/`periodStatisticsAtom` reads, and the overall map structure all remain unchanged.

## Acceptance Criteria
- [ ] `calculateDynamicMetrics` is imported and called for each period
- [ ] `StatsPeriodCard` receives `dynamicMetrics` prop (not 6 individual props)
- [ ] The old 6 inline `dynamicX` variables are removed
- [ ] `periodTasks` variable is removed (no longer needed in this file)
- [ ] The `sortedPeriods` display order (descending by `start_date`) is unchanged
- [ ] No TypeScript errors in `page.tsx`
- [ ] Page renders all periods with correct metrics (including correct `added_to_backlog` bug fix)

## Notes
- The `sortedPeriods` array is sorted descending for display but is also passed to `calculateDynamicMetrics` as `allPeriods`. The utility re-sorts internally for cumulative calculation (ascending by `start_date`), so the display sort order does not affect cumulative correctness.
- `statistics` lookup (`periodStatistics.find(...)`) remains unchanged in the page — locked values are still found and passed to the card.
