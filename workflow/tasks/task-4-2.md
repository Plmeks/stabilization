# Task 4.2: AddTaskModal

## Related Use Cases
- UC-2: Add QA Task

## Goal
Modal for adding a new QA task with title input and period dropdown.

## Changes

### New Files

#### `src/components/modals/AddTaskModal.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
  - `defaultPeriodId?: string` — pre-select a period (passed from QA tab's current period)
- Internal state: `title: string`, `periodId: string | null`, `error: string | null`, `loading: boolean`
- Uses `ModalWrapper` with title "Добавить задачу"
- Body:
  - `<Label>` + `<Input>` for task title
  - `<Label>` + `PeriodSelector` for period selection (uses `periodsAtom`)
- Footer: "Отмена" + "Добавить" (primary)
- On submit:
  1. Validate title is not empty; set `error` if empty
  2. Validate periodId is selected
  3. Call `createTaskAtom` with `{ title: title.trim(), period_id: periodId }`
  4. Call `onClose`
- Reset state when `open` changes to false

## Notes
- Period selector defaults to `defaultPeriodId` if provided, otherwise to the latest period
- URL detection in title is handled at display time by `TaskTitle` — no special handling needed here
