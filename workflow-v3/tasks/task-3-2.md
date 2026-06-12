# Task 3.2: StatsPeriodCard Restructure

## Related Use Cases
- UC-1: View Dynamic Statistics with Corrected "Добавлено" Logic
- UC-2: Lock Period Metrics with New Fields
- UC-5: View Metrics in Grouped Layout

## Task Goal
Fully rewrite `StatsPeriodCard.tsx` to accept a `DynamicMetrics` object instead of individual dynamic props, render all 15 metrics organized into 5 logical sections (A–E) using `StatsMetricGroup`, and show the `StatsComment` component only when the period has locked statistics.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/stats/StatsPeriodCard.tsx`

**New props interface:**

Remove all 6 individual `dynamic*` props. Replace with a single `dynamicMetrics: DynamicMetrics` prop:

```typescript
import type { DynamicMetrics } from '@/lib/stats-utils';

interface StatsPeriodCardProps {
  period: Period;
  statistics: PeriodStatistics | null;
  dynamicMetrics: DynamicMetrics;
}
```

**Value resolution helper:**

Inside the component, derive display values from either `statistics` (locked) or `dynamicMetrics` (dynamic):
```
const metrics = statistics ?? dynamicMetrics;
```
Since `PeriodStatistics` and `DynamicMetrics` share identical field names for all 15 metric fields, this single expression covers both cases without branching per field.

**Section rendering (replace the existing flat grid):**

Replace the single `grid grid-cols-2` block with 5 `StatsMetricGroup` sections:

**Section A — "Добавлено за неделю":**
- `StatsMetricItem` label="Добавлено всего" value={metrics.added_to_backlog}
- `StatsMetricItem` label="Критические" value={metrics.added_critical} isSubMetric
- `StatsMetricItem` label="Некритические" value={metrics.added_non_critical} isSubMetric

**Section B — "Выполнено за неделю":**
- `StatsMetricItem` label="Выполнено всего" value={metrics.resolved_total}
- `StatsMetricItem` label="Критические" value={metrics.resolved_critical} isSubMetric
- `StatsMetricItem` label="Некритические" value={metrics.resolved_non_critical} isSubMetric

**Section C — "В работе (WIP)":**
- `StatsMetricItem` label="В работе" value={metrics.in_progress}
- `StatsMetricItem` label="В тесте" value={metrics.in_testing}
- `StatsMetricItem` label="WIP итого" value={metrics.wip_total}
- `StatsMetricItem` label="В блоке" value={metrics.in_block} isSubMetric (visually separate, with note that blockers are not in WIP)

**Section D — "Накопительные":**
- `StatsMetricItem` label="Всего проблем" value={metrics.total_problems_cumulative}
- `StatsMetricItem` label="Выполнено" value={metrics.completed_cumulative}
- `StatsMetricItem` label="Незавершённые" value={metrics.uncompleted}
- `StatsMetricItem` label="Незав. критических" value={metrics.uncompleted_critical} isSubMetric
- `StatsMetricItem` label="Незав. некритических" value={metrics.uncompleted_non_critical} isSubMetric

**Section E — "Комментарий" (conditional):**
Render only when `statistics !== null`:
```tsx
{statistics !== null && (
  <StatsComment
    statisticsId={statistics.id}
    initialComment={statistics.comment}
  />
)}
```
Do NOT wrap in `StatsMetricGroup` — render it as a plain section or wrap in a `div` with a subtle `border-t pt-4` separator at the top. Use a small label `"Комментарий"` styled the same as `StatsMetricGroup` titles.

**Footer row (keep existing logic):**
- When locked (`statistics !== null`): show timestamp + edit/delete buttons (unchanged)
- When not locked: show `LockMetricsButton` (unchanged)

**Import updates needed:**
- Add: `import { StatsMetricGroup } from './StatsMetricGroup'`
- Add: `import { StatsComment } from './StatsComment'`
- Add: `import type { DynamicMetrics } from '@/lib/stats-utils'`
- Keep: `StatsMetricItem`, `LockMetricsButton`, `EditMetricsModal`, `ConfirmDialog`, `deletePeriodStatisticsAtom`
- Remove: all individual `dynamic*` prop references

## Acceptance Criteria
- [ ] Props interface uses `dynamicMetrics: DynamicMetrics` instead of 6 individual props
- [ ] All 15 metrics displayed across 5 sections
- [ ] Sections A–D always visible (both locked and dynamic)
- [ ] Section E (comment) visible ONLY when `statistics !== null`
- [ ] `metrics = statistics ?? dynamicMetrics` pattern used for value resolution
- [ ] Sub-metrics (critical/non-critical splits, in_block) use `isSubMetric` prop
- [ ] "В блоке" clearly separate from WIP — label or visual indicator makes clear it's not in `wip_total`
- [ ] Edit and delete buttons remain in the header (unchanged behavior)
- [ ] `LockMetricsButton` still shown when period is not locked (unchanged behavior)
- [ ] No TypeScript errors

## Notes
- `PeriodStatistics` has a `comment` field (string | null) but `DynamicMetrics` does not — the `??` fallback only applies to the 15 metric fields. The comment section is only shown when `statistics !== null`, so `statistics.comment` is accessed directly.
- The `EditMetricsModal` is updated in task 3.3 to include all new fields — this task does not need to change the modal, only ensure it still receives `statistics` prop.
