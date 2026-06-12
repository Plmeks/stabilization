# Task 3.1: Update QA Page Filtering and Period-Deletion Dialog

## Related Use Cases
- UC-09: Display Tasks on QA Tab
- UC-12: Delete a Period

## Task Goal
Update `src/app/qa/page.tsx` to:
1. Use the renamed `tasksByCreationPeriodAtom` (was `tasksByPeriodAtom`) for QA grouping
2. Filter QA tasks per period using `creation_period_id` instead of `period_id`
3. Show an affected-tasks warning in the period-deletion confirmation dialog

## Description of Changes

### Changed Files

#### File: `src/app/qa/page.tsx`

---

**Import updates**

Replace the `tasksByPeriodAtom` import with the new atom names:

Old:
```ts
import { qaTasksAtom, tasksByPeriodAtom, deleteTaskAtom, takeIntoWorkAtom } from '@/atoms/tasksAtom';
```

New:
```ts
import { qaTasksAtom, tasksByCreationPeriodAtom, tasksByActivePeriodAtom, deleteTaskAtom, takeIntoWorkAtom } from '@/atoms/tasksAtom';
```

---

**Atom usage**

Replace:
```ts
const tasksByPeriod = useAtomValue(tasksByPeriodAtom);
```
With:
```ts
const tasksByCreationPeriod = useAtomValue(tasksByCreationPeriodAtom);
const tasksByActivePeriod = useAtomValue(tasksByActivePeriodAtom);
```

---

**Period filtering for QA task list**

Inside the `periods.map(...)` loop, change the per-period task filter:

Old:
```ts
const periodQATasks = qaTasks.filter((t) => t.period_id === period.id);
const totalCount = tasksByPeriod[period.id]?.length ?? 0;
```

New:
```ts
const periodQATasks = qaTasks.filter((t) => t.creation_period_id === period.id);
const totalCount = tasksByCreationPeriod[period.id]?.length ?? 0;
```

Also update the critical count line:
Old:
```ts
criticalCount={(tasksByPeriod[period.id] ?? []).filter((t) => t.priority === 'Авария').length}
```
New:
```ts
criticalCount={(tasksByCreationPeriod[period.id] ?? []).filter((t) => t.priority === 'Авария').length}
```

---

**Period deletion confirmation — affected tasks warning**

Add a variable that computes the count of tasks from other creation periods that will have their `active_period_id` reset (not deleted, just reassigned):

```ts
const affectedActivePeriodTaskCount = showDeletePeriodConfirm
  ? (tasksByActivePeriod[showDeletePeriodConfirm] ?? [])
      .filter((t) => t.creation_period_id !== showDeletePeriodConfirm).length
  : 0;
```

Update the `ConfirmDialog` for period deletion to include the warning. Change the `message` prop:

Old:
```ts
message={`Будут удалены все задачи периода (${deletePeriodTaskCount} шт.)`}
```

New:
```ts
message={
  affectedActivePeriodTaskCount > 0
    ? `Будут удалены все задачи периода (${deletePeriodTaskCount} шт.). Также у ${affectedActivePeriodTaskCount} задач из других периодов будет сброшен активный период.`
    : `Будут удалены все задачи периода (${deletePeriodTaskCount} шт.).`
}
```

Note: The existing variable `deletePeriodTaskCount` uses `tasksByPeriod` — update it to use `tasksByCreationPeriod`:

Old:
```ts
const deletePeriodTaskCount = showDeletePeriodConfirm
  ? (tasksByPeriod[showDeletePeriodConfirm]?.length ?? 0)
  : 0;
```
New:
```ts
const deletePeriodTaskCount = showDeletePeriodConfirm
  ? (tasksByCreationPeriod[showDeletePeriodConfirm]?.length ?? 0)
  : 0;
```

---

**All other logic** (period expansion, toggleAll, add task, delete task, takeIntoWork) remains unchanged.

## Acceptance Criteria
- [ ] `tasksByCreationPeriodAtom` and `tasksByActivePeriodAtom` are imported and used
- [ ] QA tasks per period are filtered by `creation_period_id`
- [ ] Task counts and critical counts for period sections use `creation_period_id`
- [ ] Period-deletion dialog shows deleted count (from `creation_period_id`) and affected count (from `active_period_id`) when applicable
- [ ] No `period_id` or `tasksByPeriodAtom` references remain

## Notes
The `qaTasks` atom (`qaTasksAtom`) returns all tasks — filtering by period is done in this component. This behavior is unchanged; only the field name used for filtering changes.
