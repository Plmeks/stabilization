# Task 2.2: Update Tasks Jotai Atom

## Related Use Cases
- UC-01: Create a New Task
- UC-02: Take Task into Work
- UC-03: Complete a Task
- UC-04: Return Task from Completed to QA
- UC-05: Return Task from Completed to Work
- UC-06: Return Task from Current to QA
- UC-09: Display Tasks on QA Tab
- UC-10: Display Tasks on Completed Tab
- UC-12: Delete a Period

## Task Goal
Update `src/atoms/tasksAtom.ts` so that all write atoms apply correct optimistic updates for both `creation_period_id` and `active_period_id`, pass the required `latestPeriodId` to updated DAL functions, and expose new derived atoms needed by the UI.

## Description of Changes

### Changed Files

#### File: `src/atoms/tasksAtom.ts`

---

**New imports**

Add the import for `periodsAtom` (needed to resolve the latest period in write atoms):
```ts
import { periodsAtom } from '@/atoms/periodsAtom';
```

Update the DAL imports to include the new function signatures:
```ts
import {
  fetchTasks,
  createTask,
  takeIntoWork,
  updateTask,
  completeTask,
  returnTaskToWork,
  deleteTask,
  returnTaskToQA,
} from '@/lib/supabase/dal';
```
(No new DAL functions needed in this atom — `transferWipTasks` and `resetActivePeriodForDeletion` are called from `periodsAtom`.)

---

**Atom `createTaskAtom`**

The optimistic `tempTask` must include both period fields.

Change:
```ts
period_id: input.period_id,
```
To:
```ts
creation_period_id: input.creation_period_id,
active_period_id: input.creation_period_id,
```

(At creation time, `active_period_id` always equals `creation_period_id`.)

---

**Atom `takeIntoWorkAtom`**

This atom must:
1. Resolve the latest period ID from `periodsAtom` before performing the optimistic update
2. Include `active_period_id` in the optimistic update
3. Pass `latestPeriodId` to the `takeIntoWork` DAL call

At the start of the write function, resolve the latest period:
```ts
const periods = get(periodsAtom);
const latestPeriodId = periods[0]?.id ?? '';
```

(`periodsAtom` is already sorted descending by `start_date` then `end_date` — `periods[0]` is the latest.)

Update the optimistic spread to add:
```ts
active_period_id: latestPeriodId,
```

Update the DAL call:
```ts
const updated = await takeIntoWork(id, latestPeriodId);
```

---

**Atom `completeTaskAtom`**

The optimistic update currently sets `period_id: input.period_id`. Change to:
```ts
active_period_id: input.active_period_id,
```

Remove the `period_id` reference entirely.

---

**Atom `returnToQAAtom`**

The optimistic update must also reset `active_period_id`. Find the current task in the atom state, then add `active_period_id` to the spread:

```ts
const taskToReturn = previous.find((t) => t.id === id);
set(tasksAtom, previous.map((t) =>
  t.id === id
    ? {
        ...t,
        status: null,
        taken_into_work_at: null,
        completed_at: null,
        assignee: null,
        active_period_id: taskToReturn?.creation_period_id ?? t.active_period_id,
      }
    : t,
));
```

No changes needed to the DAL call (`returnTaskToQA` handles the `active_period_id` reset internally via two-step fetch+update).

---

**Atom `returnTaskToWorkAtom`**

This atom must:
1. Resolve the latest period ID from `periodsAtom`
2. Include `active_period_id` in the optimistic update
3. Pass `latestPeriodId` to the `returnTaskToWork` DAL call

At the start of the write function:
```ts
const periods = get(periodsAtom);
const latestPeriodId = periods[0]?.id ?? '';
```

Update the optimistic spread to add:
```ts
active_period_id: latestPeriodId,
```

Update the DAL call:
```ts
const updated = await returnTaskToWork(id, input, latestPeriodId);
```

---

**Derived atom `tasksByPeriodAtom` → rename to `tasksByCreationPeriodAtom`**

Rename the atom export and change the grouping key from `task.period_id` to `task.creation_period_id`:

```ts
export const tasksByCreationPeriodAtom = atom((get) =>
  get(tasksAtom).reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.creation_period_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {}),
);
```

---

**New derived atom `tasksByActivePeriodAtom`**

Add a new exported atom that groups tasks by `active_period_id`. This is used by the QA page to count tasks affected by a period deletion:

```ts
export const tasksByActivePeriodAtom = atom((get) =>
  get(tasksAtom).reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.active_period_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {}),
);
```

---

**Atoms `updateTaskAtom`, `deleteTaskAtom`, `fetchTasksAtom`, `qaTasksAtom`, `currentTasksAtom`, `completedTasksAtom`:** No changes needed.

## Acceptance Criteria
- [ ] `createTaskAtom` optimistic task has `creation_period_id` and `active_period_id` (no `period_id`)
- [ ] `takeIntoWorkAtom` reads latest period from `periodsAtom` and passes it to DAL + sets it in optimistic update
- [ ] `completeTaskAtom` optimistic update sets `active_period_id` (not `period_id`)
- [ ] `returnToQAAtom` optimistic update sets `active_period_id = creation_period_id` of the task
- [ ] `returnTaskToWorkAtom` reads latest period and passes to DAL + sets it in optimistic update
- [ ] `tasksByCreationPeriodAtom` is exported (replaces `tasksByPeriodAtom`), groups by `creation_period_id`
- [ ] `tasksByActivePeriodAtom` is exported, groups by `active_period_id`
- [ ] No `period_id` references remain in the file

## Notes
- `periodsAtom` is safe to import from `tasksAtom` — there is no circular dependency since `periodsAtom` currently imports nothing from `tasksAtom` (that import direction will be added in task-2-3, but the other direction is safe in Jotai).
- `periods[0]` is always the latest because `periodsAtom` maintains a descending sort by `start_date, end_date` (see `fetchPeriodsAtom` and `createPeriodAtom` in `periodsAtom.ts`).
- If `periods` is empty (no periods), `latestPeriodId` falls back to `''`. This situation shouldn't occur in practice (tasks can't exist without periods due to the FK), but the fallback prevents runtime errors.
