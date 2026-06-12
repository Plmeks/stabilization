# Task 3.3: EditMetricsModal Expansion

## Related Use Cases
- UC-3: Edit Locked Metrics

## Task Goal
Expand `EditMetricsModal.tsx` to include all 15 new metric fields, organized into the same 4 logical groups (Added, Resolved, WIP, Cumulative). The modal remains a single scrollable form — no tabs needed.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/modals/EditMetricsModal.tsx`

**1. Update `MetricsState` type** to include all 15 numeric metric fields:

```typescript
type MetricsState = {
  // Added
  added_to_backlog: number;
  added_critical: number;
  added_non_critical: number;
  // Resolved
  resolved_total: number;
  resolved_critical: number;
  resolved_non_critical: number;
  // WIP
  in_progress: number;
  in_testing: number;
  in_block: number;
  wip_total: number;
  // Cumulative
  total_problems_cumulative: number;
  completed_cumulative: number;
  uncompleted: number;
  uncompleted_critical: number;
  uncompleted_non_critical: number;
};
```

**2. Initialize state** from `statistics` prop with all 15 fields (same pattern as current 6 fields).

**3. Replace the form layout** with 4 labeled groups. Use a `div` with `space-y-5` wrapper. Within each group, use a small `p` label styled identically to `StatsMetricGroup` titles (`text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2`), then a `grid grid-cols-2 gap-4` for the inputs.

**Group 1 — "Добавлено за неделю":**
- Input for `added_to_backlog` (label: "Добавлено всего")
- Input for `added_critical` (label: "Критических")
- Input for `added_non_critical` (label: "Некритических")

**Group 2 — "Выполнено за неделю":**
- Input for `resolved_total` (label: "Выполнено всего")
- Input for `resolved_critical` (label: "Критических")
- Input for `resolved_non_critical` (label: "Некритических")

**Group 3 — "В работе (WIP)":**
- Input for `in_progress` (label: "В работе")
- Input for `in_testing` (label: "В тесте")
- Input for `wip_total` (label: "WIP итого")
- Input for `in_block` (label: "В блоке")

**Group 4 — "Накопительные":**
- Input for `total_problems_cumulative` (label: "Всего проблем")
- Input for `completed_cumulative` (label: "Выполнено всего")
- Input for `uncompleted` (label: "Незавершённые")
- Input for `uncompleted_critical` (label: "Незав. критических")
- Input for `uncompleted_non_critical` (label: "Незав. некритических")

**4. `handleChange` remains the same pattern** — a generic handler `(field: keyof MetricsState) => (e) => setMetrics(...)`.

**5. `handleSave` logic is unchanged** — calls `updateStatistics({ id: statistics.id, metrics })`.

**6. Modal title** — change from "Редактировать метрики" to "Редактировать метрики периода" for clarity (optional, but recommended).

**7. `ModalWrapper`** — the modal will be taller with 15 fields. Ensure the modal has a `max-height` and is scrollable. Check if `ModalWrapper` already handles overflow scroll; if not, add `className="overflow-y-auto max-h-[80vh]"` to the content container inside the modal.

## Acceptance Criteria
- [ ] All 15 metric fields are editable in the modal
- [ ] Fields are organized in 4 labeled groups (Added, Resolved, WIP, Cumulative)
- [ ] State initializes all 15 fields from `statistics` prop
- [ ] `handleSave` passes all 15 fields to `updatePeriodStatisticsAtom`
- [ ] Modal is scrollable when content overflows
- [ ] All `Input` elements have correct `type="number" min="0"`
- [ ] No TypeScript errors
- [ ] Error message still shown on save failure (existing behavior preserved)

## Notes
- The `comment` field is intentionally NOT included in this modal — comments have their own dedicated `StatsComment` component with debounced auto-save. Mixing comment editing into this modal would create UX inconsistency.
- `updatePeriodStatisticsAtom` accepts `MetricsPayload` which is now `Omit<PeriodStatistics, 'id' | 'period_id' | 'comment' | 'locked_at' | 'created_at'>` — all 15 numeric fields. The `MetricsState` in this modal must match exactly.
