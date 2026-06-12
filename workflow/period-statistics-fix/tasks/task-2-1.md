# Task 2.1: Update Statistics Calculation Logic

## Related Use Cases
- UC-08: Calculate Dynamic Metrics for a Period

## Task Goal
Fix `calculateDynamicMetrics` in `src/lib/stats-utils.ts` so that each of the 15 metrics uses the correct period ID field. "Added" and cumulative metrics use `creation_period_id`; "resolved" and WIP metrics use `active_period_id`.

## Description of Changes

### Changed Files

#### File: `src/lib/stats-utils.ts`

**Function `calculateDynamicMetrics(period, allPeriods, allTasks)`**

The function signature does not change. `Task` type now has `creation_period_id` and `active_period_id` instead of `period_id`. Update the internal filtering as follows:

---

**"Added" metrics — filter by `creation_period_id`**

Replace:
```ts
const periodTasks = allTasks.filter((t) => t.period_id === period.id);
```
With:
```ts
const creationPeriodTasks = allTasks.filter((t) => t.creation_period_id === period.id);
```

Then use `creationPeriodTasks` for:
- `added_to_backlog = creationPeriodTasks.length`
- `added_critical = creationPeriodTasks.filter((t) => t.priority === 'Авария').length`
- `added_non_critical = creationPeriodTasks.filter((t) => t.priority !== 'Авария').length`

---

**"Resolved" metrics — filter by `active_period_id AND status = 'Завершена'`**

Add a second filter:
```ts
const activePeriodTasks = allTasks.filter((t) => t.active_period_id === period.id);
```

Then:
- `resolved_total = activePeriodTasks.filter((t) => t.status === 'Завершена').length`
- `resolved_critical = activePeriodTasks.filter((t) => t.status === 'Завершена' && t.priority === 'Авария').length`
- `resolved_non_critical = activePeriodTasks.filter((t) => t.status === 'Завершена' && t.priority !== 'Авария').length`

---

**WIP metrics — filter by `active_period_id AND status IN WIP`**

Re-use `activePeriodTasks` (already computed above):
- `in_progress = activePeriodTasks.filter((t) => t.status === 'В работе').length`
- `in_testing = activePeriodTasks.filter((t) => t.status === 'В тесте').length`
- `in_block = activePeriodTasks.filter((t) => t.status === 'Блокер').length`
- `wip_total = in_progress + in_testing` (unchanged formula)

---

**Cumulative metrics — filter by `creation_period_id` for period membership**

The cumulative section identifies "all tasks up to and including this period". Replace the existing `tasksUpToThis` filter:

Replace:
```ts
const tasksUpToThis = allTasks.filter((t) =>
  periodsUpToThis.some((p) => p.id === t.period_id),
);
```
With:
```ts
const tasksUpToThis = allTasks.filter((t) =>
  periodsUpToThis.some((p) => p.id === t.creation_period_id),
);
```

The `periodsUpToThis` computation (sorting and filtering by `start_date`) and the cumulative metric formulas remain unchanged.

---

**Import update:** No new imports needed. `dayjs` and `isSameOrBefore` plugin remain.

## Acceptance Criteria
- [ ] `added_to_backlog` and `added_*` metrics count tasks by `creation_period_id`
- [ ] `resolved_*` metrics count tasks by `active_period_id AND status = 'Завершена'`
- [ ] WIP metrics (`in_progress`, `in_testing`, `in_block`, `wip_total`) count by `active_period_id`
- [ ] Cumulative metrics use `creation_period_id` for period-membership check
- [ ] No `period_id` references remain in the function
- [ ] The function signature `(period, allPeriods, allTasks)` is unchanged

## Notes
The example scenario from UC-08 is the key correctness check:
- Period A has 3 tasks created → `added_to_backlog = 3`, but after WIP transfer `in_progress = 0`, `resolved_total = 1`
- Period B has 0 tasks created → `added_to_backlog = 0`, but `in_progress = 1` (WIP tasks transferred here)
- After taking Period A's backlog task into work in Period B: `in_progress = 2`
