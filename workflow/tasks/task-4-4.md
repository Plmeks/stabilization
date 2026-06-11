# Task 4.4: EditTaskModal

## Related Use Cases
- UC-4: Edit Task
- UC-6: Return to Work from Completed

## Goal
Modal for editing task fields. When status changes to "Завершена", opens `CompleteTaskModal` as the next step. When editing a completed task and status changes to non-"Завершена", triggers return-to-work logic.

## Changes

### New Files

#### `src/components/modals/EditTaskModal.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
  - `task: Task`
  - `context: 'current' | 'completed'` — determines which status change logic to trigger
- Internal state: `assignee: string`, `priority: Priority | ''`, `status: TaskStatus`, `loading: boolean`, `showCompleteModal: boolean`
- Pre-fill state from `task` when modal opens
- Uses `ModalWrapper` with title "Редактировать задачу"
- Body:
  - `<Input>` for Исполнитель
  - `Select` for Приоритет (all options + "Не указан" empty)
  - `Select` for Статус (all 5 statuses)
- Footer: "Отмена" + "Сохранить"
- On save:
  - **If `context = 'current'` and new status = "Завершена"**: close this modal, open `CompleteTaskModal` (set `showCompleteModal = true`)
  - **If `context = 'completed'` and new status ≠ "Завершена"**: call `returnTaskToWorkAtom(task.id, { assignee, priority: priority || null, status })`; call `onClose`
  - **Otherwise**: call `updateTaskAtom(task.id, { assignee, priority: priority || null, status })`; call `onClose`
- Renders `CompleteTaskModal` inline when `showCompleteModal = true`, passing the pending task id and pending update data

## Notes
- `CompleteTaskModal` is a separate component imported here
- When `context = 'completed'`, all status options are available (including "Завершена")
- Reset state on `open` change
