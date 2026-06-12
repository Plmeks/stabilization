# Task 3.3: Update Modals (AddTaskModal, EditTaskModal)

## Related Use Cases
- UC-01: Create a New Task
- UC-03: Complete a Task
- UC-05: Return Task from Completed to Work
- UC-11: Edit Task Fields

## Task Goal
Update `AddTaskModal` and `EditTaskModal` to use the new period field names. Ensure `CompleteTaskModal` defaults to the latest period (not `task.active_period_id`).

## Description of Changes

### Changed Files

#### File: `src/components/modals/AddTaskModal.tsx`

**`handleSubmit` function**

The `createTask` call currently passes `period_id: periodId`. Change to `creation_period_id`:

Old:
```ts
await createTask({
  title: title.trim(),
  period_id: periodId,
  ...(isCritical ? { priority: 'Авария' } : {}),
  ...(link.trim() ? { link: link.trim() } : {}),
});
```

New:
```ts
await createTask({
  title: title.trim(),
  creation_period_id: periodId,
  ...(isCritical ? { priority: 'Авария' } : {}),
  ...(link.trim() ? { link: link.trim() } : {}),
});
```

Everything else in `AddTaskModal` is unchanged (period selector, validation, UI).

---

#### File: `src/components/modals/EditTaskModal.tsx`

**`CompleteTaskModal` invocation — remove `defaultPeriodId` prop**

Per TS §4.3 decision D3: the CompleteTaskModal must pre-select the **latest period** by default, not the task's current `active_period_id`. The `CompleteTaskModal` already defaults to `periods[0]` (latest, since `periodsAtom` is sorted descending) when no valid `defaultPeriodId` is provided.

Currently the EditTaskModal passes:
```ts
defaultPeriodId={task.period_id}
```

After removing `period_id` from `Task`, this becomes invalid. The fix: **remove the `defaultPeriodId` prop entirely** from the `CompleteTaskModal` invocation inside `EditTaskModal`. This causes `CompleteTaskModal` to always fall back to `periods[0]` (the latest period), which is the desired behavior.

Old:
```tsx
<CompleteTaskModal
  open={showCompleteModal}
  onClose={() => { setShowCompleteModal(false); onClose(); }}
  onCancel={() => setShowCompleteModal(false)}
  taskId={task.id}
  pendingTaskUpdate={pendingUpdate}
  defaultPeriodId={task.period_id}
/>
```

New:
```tsx
<CompleteTaskModal
  open={showCompleteModal}
  onClose={() => { setShowCompleteModal(false); onClose(); }}
  onCancel={() => setShowCompleteModal(false)}
  taskId={task.id}
  pendingTaskUpdate={pendingUpdate}
/>
```

**`handleSave` function — no changes needed for UC-05 (returnTaskToWork)**

The `returnTaskToWorkAtom` (updated in task-2-2) now reads the latest period internally. The `EditTaskModal` calls `returnTaskToWork({ id: task.id, input })` — the atom signature is unchanged from the UI perspective; the atom resolves `latestPeriodId` internally via `periodsAtom`. No changes needed here.

**`handleSave` function — no changes needed for UC-11 (simple field edit)**

`updateTask({ id: task.id, input })` is unchanged. `UpdateTaskInput` does not include period fields, so simple field edits never modify `creation_period_id` or `active_period_id`.

---

#### File: `src/components/modals/CompleteTaskModal.tsx`

**No changes required.**

The modal already defaults to `periods[0]` when no valid `defaultPeriodId` is provided (see the `useEffect` initialization: `setSelectedPeriodId(hasDefault ? defaultPeriodId : periods[0].id)`). By removing the `defaultPeriodId` prop in `EditTaskModal`, the modal automatically uses the latest period.

The `completeTaskAtom` call passes `{ period_id: selectedPeriodId }` — this must change because `CompletionInput.period_id` is now `CompletionInput.active_period_id`. Update in `CompleteTaskModal`:

Old:
```ts
await completeTask({ id: taskId, input: { period_id: selectedPeriodId } });
```

New:
```ts
await completeTask({ id: taskId, input: { active_period_id: selectedPeriodId } });
```

This is the only change in `CompleteTaskModal`.

## Acceptance Criteria
- [ ] `AddTaskModal` passes `creation_period_id` (not `period_id`) to `createTask`
- [ ] `EditTaskModal` no longer passes `defaultPeriodId` to `CompleteTaskModal`
- [ ] `CompleteTaskModal` passes `active_period_id` (not `period_id`) to `completeTask`
- [ ] No `period_id` references remain in any of the three files
- [ ] Task creation flow is unchanged from user perspective
- [ ] Task completion defaults to latest period (not `task.active_period_id`)

## Notes
`CompleteTaskModal` is included in this task because of the `active_period_id` fix in the `completeTask` call, even though its main structural change is driven by the `EditTaskModal` prop removal.
