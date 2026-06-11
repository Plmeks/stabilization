# Task 4.3: TakeIntoWorkModal

## Related Use Cases
- UC-3: Take Into Work

## Goal
Modal shown when user clicks "Взять в работу" — collects optional assignee, priority, and status.

## Changes

### New Files

#### `src/components/modals/TakeIntoWorkModal.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
  - `task: Task`
- Internal state: `assignee: string`, `priority: Priority | ''`, `status: TaskStatus`, `loading: boolean`
- Default values on open: `status = 'В работе'` (TS review fix), `priority = ''`, `assignee = ''`
- Uses `ModalWrapper` with title "Взять в работу"
- Body (all fields optional):
  - `<Input>` for Исполнитель
  - shadcn/ui `Select` for Приоритет (options from `PRIORITIES`, plus empty "Не указан" option)
  - shadcn/ui `Select` for Статус (options from `TASK_STATUSES` except "Завершена")
- Footer: "Отмена" + "Подтвердить" (primary)
- On confirm:
  1. Build `input: TakeIntoWorkInput` — include only non-empty fields
  2. Call `takeIntoWorkAtom(task.id, input)`
  3. Call `onClose`
- All fields optional — user can submit with empty values

## Notes
- Do NOT include "Завершена" in the status dropdown here
- Reset form on close
