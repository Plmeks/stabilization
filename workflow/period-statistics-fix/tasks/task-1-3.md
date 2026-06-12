# Task 1.3: Update DAL Functions

## Related Use Cases
- UC-01: Create a New Task
- UC-02: Take Task into Work
- UC-03: Complete a Task
- UC-04: Return Task from Completed to QA
- UC-05: Return Task from Completed to Work
- UC-06: Return Task from Current to QA
- UC-07: Create a New Period (WIP transfer)
- UC-12: Delete a Period

## Task Goal
Update all existing task-related DAL functions to use `creation_period_id` / `active_period_id` instead of `period_id`, and add three new DAL functions for batch WIP transfer, pre-deletion active_period reset, and affected-task counting.

## Description of Changes

### Changed Files

#### File: `src/lib/supabase/dal.ts`

---

**Function `createTask(input: CreateTaskInput): Promise<Task>`**

Currently inserts with `period_id`. Change to insert both period fields. The insert payload becomes `{ ...input, active_period_id: input.creation_period_id }` — since at creation time `active_period_id` always equals `creation_period_id`.

Logic:
- Build insert payload: spread `input` (which now has `creation_period_id`) and add `active_period_id: input.creation_period_id`
- Perform `.insert(payload).select().single()` as before
- Return `data as Task`

---

**Function `takeIntoWork(id: string, latestPeriodId: string): Promise<Task>`**

Add a second parameter `latestPeriodId: string`. The update payload must now include `active_period_id: latestPeriodId`.

Logic:
- Fetch existing priority (same as current: `.select('priority').eq('id', id).single()`)
- Resolve priority: `existing.priority ?? 'Нормальный'`
- Update with: `{ status: 'В работе', taken_into_work_at: new Date().toISOString(), priority, active_period_id: latestPeriodId }`
- Return `data as Task`

---

**Function `completeTask(id: string, input: CompletionInput): Promise<Task>`**

`CompletionInput` now has `active_period_id` instead of `period_id`. Update the `.update()` payload:

Change:
```ts
period_id: input.period_id,
```
To:
```ts
active_period_id: input.active_period_id,
```

Everything else remains the same.

---

**Function `returnTaskToQA(id: string): Promise<Task>`**

Must reset `active_period_id` to the task's own `creation_period_id`. The Supabase JS client does not support self-referencing column updates, so use a two-step approach:

Step 1: Fetch the task's `creation_period_id`:
```ts
const { data: existing, error: fetchError } = await supabase
  .from('tasks')
  .select('creation_period_id')
  .eq('id', id)
  .single();
if (fetchError) throw fetchError;
```

Step 2: Update with reset values including `active_period_id`:
```ts
.update({
  status: null,
  taken_into_work_at: null,
  completed_at: null,
  assignee: null,
  active_period_id: existing.creation_period_id,
})
```

Return `data as Task`.

---

**Function `returnTaskToWork(id: string, input: UpdateTaskInput, latestPeriodId: string): Promise<Task>`**

Add a third parameter `latestPeriodId: string`. The update payload must include `active_period_id: latestPeriodId`.

Change the update call to:
```ts
.update({ completed_at: null, ...input, active_period_id: latestPeriodId })
```

Return `data as Task`.

---

**New function `transferWipTasks(newPeriodId: string): Promise<Task[]>`**

Batch-updates all WIP tasks to set `active_period_id = newPeriodId`. Called after creating a new period that is the latest.

Logic:
- `.update({ active_period_id: newPeriodId })`
- `.in('status', ['В работе', 'В тесте', 'Блокер'])`
- `.select()`
- If error, throw
- Return `data as Task[]` (may be empty array if no WIP tasks)

---

**New function `resetActivePeriodForDeletion(periodId: string): Promise<Task[]>`**

Before a period is deleted, resets `active_period_id = creation_period_id` for tasks that are "visiting" the period but were created elsewhere. Returns the updated tasks so the atom layer can sync Jotai state.

Logic:

Step 1: Fetch all affected tasks (those that have `active_period_id = periodId` but `creation_period_id != periodId`):
```ts
const { data: affected, error: fetchError } = await supabase
  .from('tasks')
  .select('*')
  .eq('active_period_id', periodId)
  .neq('creation_period_id', periodId);
if (fetchError) throw fetchError;
if (!affected || affected.length === 0) return [];
```

Step 2: For each affected task, update `active_period_id = task.creation_period_id`. Run updates in parallel:
```ts
const results = await Promise.all(
  (affected as Task[]).map(async (task) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ active_period_id: task.creation_period_id })
      .eq('id', task.id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }),
);
return results;
```

---

### Import updates

No new imports needed — the function only uses the existing `supabase` client and existing `Task` type. The updated types (`CreateTaskInput`, `CompletionInput`) are already imported.

## Acceptance Criteria
- [ ] `createTask` inserts both `creation_period_id` and `active_period_id`
- [ ] `takeIntoWork` accepts `latestPeriodId` and sets `active_period_id` in the update
- [ ] `completeTask` updates `active_period_id` (not `period_id`)
- [ ] `returnTaskToQA` resets `active_period_id = creation_period_id` via two-step fetch+update
- [ ] `returnTaskToWork` accepts `latestPeriodId` and sets `active_period_id`
- [ ] `transferWipTasks` batch-updates all WIP tasks' `active_period_id`
- [ ] `resetActivePeriodForDeletion` fetches and per-task-updates affected tasks, returns `Task[]`
- [ ] No `period_id` references remain in the file

## Notes
The `returnTaskToQA` two-step approach (fetch + update) is intentional. Supabase JS `.update()` does not support `SET col_a = col_b` self-referencing syntax. Using a PL/pgSQL RPC was considered but avoided to keep the migration file clean.
