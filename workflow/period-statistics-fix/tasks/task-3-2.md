# Task 3.2: Update Completed Page and CompletedTasksTable

## Related Use Cases
- UC-10: Display Tasks on Completed Tab

## Task Goal
Update `src/app/completed/page.tsx` to group completed tasks by `active_period_id`, and update `src/components/completed/CompletedTasksTable.tsx` to resolve the row's period using `task.active_period_id` instead of `task.period_id` (which is removed in task 1-2).

## Description of Changes

### Changed Files

#### File: `src/app/completed/page.tsx`

**`completedTasksByPeriod` useMemo**

This memo builds the Map used to group completed tasks by period. Change the key from `task.period_id` to `task.active_period_id`:

Old:
```ts
const map = new Map<string, Task[]>();
for (const task of completedTasks) {
  const existing = map.get(task.period_id) ?? [];
  map.set(task.period_id, [...existing, task]);
}
```

New:
```ts
const map = new Map<string, Task[]>();
for (const task of completedTasks) {
  const existing = map.get(task.active_period_id) ?? [];
  map.set(task.active_period_id, [...existing, task]);
}
```

A task created in Period A but completed in Period B will appear under Period B's section on the Completed tab, correctly reflecting where it was archived.

**Everything else** (period filtering for `periodsWithTasks`, expansion state, toggle handlers, EditTaskModal, ConfirmDialog) is unchanged.

---

#### File: `src/components/completed/CompletedTasksTable.tsx`

**`periodMap.get(task.period_id)` reference**

The `periodMap` lookup inside `tasks.map(...)` still uses `task.period_id`, which is removed from the `Task` type by task 1-2. Change to `task.active_period_id`:

Old:
```tsx
<CompletedTasksRow
  key={task.id}
  task={task}
  period={periodMap.get(task.period_id)}
  onEdit={() => onEdit(task)}
  onReturnToQA={() => onReturnToQA(task.id)}
/>
```

New:
```tsx
<CompletedTasksRow
  key={task.id}
  task={task}
  period={periodMap.get(task.active_period_id)}
  onEdit={() => onEdit(task)}
  onReturnToQA={() => onReturnToQA(task.id)}
/>
```

Note: `CompletedTasksRow` receives `period: Period | undefined` in its props interface but does not currently use it in its render body. The lookup is kept here for forward-compatibility (it may be used in the future), but no changes are needed inside `CompletedTasksRow.tsx` itself.

## Acceptance Criteria
- [ ] Completed tasks are grouped by `active_period_id` in `completed/page.tsx`
- [ ] `CompletedTasksTable.tsx` uses `task.active_period_id` (not `task.period_id`) in the `periodMap.get()` call
- [ ] A task created in Period A but completed in Period B appears under Period B on the Completed tab
- [ ] No `period_id` references remain in either file
- [ ] TypeScript compiles without errors in these files after task 1-2 removes `Task.period_id`

## Notes
`CompletedTasksRow.tsx` does not need changes — it only receives `period` as a prop and does not reference `task.period_id` internally.
