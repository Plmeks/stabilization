# Task 4.5: CompleteTaskModal

## Related Use Cases
- UC-5: Complete Task

## Goal
Step-2 modal shown after user sets status to "Завершена" — lets user pick which period to archive the task into.

## Changes

### New Files

#### `src/components/modals/CompleteTaskModal.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
  - `onCancel: () => void` — called when user cancels (returns to EditTaskModal)
  - `taskId: string`
  - `pendingTaskUpdate?: UpdateTaskInput` — other field changes from EditTaskModal to apply simultaneously
- Internal state: `selectedPeriodId: string | null`, `loading: boolean`
- On open: auto-select the latest period (`periodsAtom[0]`)
- Uses `ModalWrapper` with title "Завершить задачу"
- Body: text "Выберите период для архивации:" + `PeriodSelector` with `defaultToLatest = true`
- Footer: "Отмена" (calls `onCancel`) + "Завершить" (primary)
- On confirm:
  1. Call `completeTaskAtom(taskId, { period_id: selectedPeriodId })`
  2. If `pendingTaskUpdate` has other fields (assignee, priority), also call `updateTaskAtom` — or merge into one call
  3. Call `onClose`

## Notes
- This modal is opened by `EditTaskModal` (not directly by tab pages)
- "Отмена" should revert to previous state — since both use optimistic updates, this is handled by not calling any atom and just closing
