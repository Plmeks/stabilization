# Task 5.1 Result

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/components/shared/ActionButtons.tsx` — Removed `returnToQa` boolean prop; added `onReturnToQA?: () => void` prop; Undo2 button now renders conditionally before the delete button; delete button always shows Trash2 and always calls `onDelete`
- `src/components/current/CurrentTasksRow.tsx` — Added `onReturnToQA: () => void` to props; removed `returnToQa` from `ActionButtons` usage; passes `onReturnToQA` to `ActionButtons`
- `src/components/current/CurrentTasksTable.tsx` — Added `onReturnToQA: (taskId: string) => void` to props; passes `onReturnToQA={() => onReturnToQA(task.id)}` to each `CurrentTasksRow`
- `src/app/current/page.tsx` — Imported `deleteTaskAtom`; added `deleteTask` setter; added `deletingTaskId` state + `deleteLoading` state; added second `ConfirmDialog` for delete; wired `onReturnToQA={setReturningTaskId}` and `onDelete={setDeletingTaskId}` correctly
- `src/components/completed/CompletedTasksRow.tsx` — Minimal fix: replaced `returnToQa` (removed prop) with `onReturnToQA={onDelete}` to fix TypeScript compilation; behavior is preserved (Task 5.2 will fully refactor this file)

## Notes
- The `CompletedTasksRow` previously passed `returnToQa={true}` and used `onDelete` as the return-to-QA callback. The minimal fix passes `onReturnToQA={onDelete}` to preserve that behavior while satisfying the TypeScript compiler. Task 5.2 will properly separate delete vs return-to-QA in the completed tab.
- TypeScript compilation passes with zero errors.
