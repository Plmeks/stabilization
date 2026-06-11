# Task 5.1: QA Tab Page

## Related Use Cases
- UC-2: Add QA Task
- UC-3: Take Into Work
- UC-8: Delete Task
- UC-9: Delete Period
- UC-11: Collapse/Expand Periods

## Goal
Build the "Новые задачи / QA" tab — list of periods with tasks, add buttons, and "Взять в работу" actions.

## Changes

### Modified Files

#### `src/app/qa/page.tsx`
- Client component
- Reads `periodsAtom`, `qaTasksAtom`, `tasksByPeriodAtom`, `expandedPeriodsAtom`
- State: `showCreatePeriodModal: boolean`, `showAddTaskModal: boolean`, `addTaskDefaultPeriodId: string | null`, `showDeletePeriodConfirm: string | null` (period id), `showTakeIntoWorkModal: Task | null`, `showDeleteTaskConfirm: string | null`
- Layout:
  - Top bar: "Добавить период" button (opens `CreatePeriodModal`) + "Добавить задачу" button (opens `AddTaskModal` without default period)
  - List of `QAPeriodSection` components, one per period, sorted newest first
- Renders all modals at the bottom: `CreatePeriodModal`, `AddTaskModal`, `TakeIntoWorkModal`, `ConfirmDialog` (for period and task deletion)

### New Files

#### `src/components/qa/QAPeriodSection.tsx`
- Props:
  - `period: Period`
  - `tasks: Task[]` — filtered QA tasks for this period (`qaTasksAtom` filtered by `period_id`)
  - `isExpanded: boolean`
  - `onToggle: () => void`
  - `onAddTask: (periodId: string) => void`
  - `onDeletePeriod: (periodId: string) => void`
- Uses `PeriodAccordion` as wrapper
- `headerActions` slot: "Добавить задачу" small button + delete period button (`Trash2` icon)
- Body: list of `QATaskListItem` for each task

#### `src/components/qa/QATaskListItem.tsx`
- Props:
  - `task: Task`
  - `onTakeIntoWork: (task: Task) => void`
  - `onDelete: (taskId: string) => void`
- Layout: flex row
  - `TaskTitle` for task name
  - `PriorityBadge` (if set)
  - `StatusBadge`
  - Right side: "Взять в работу" button (hidden if `task.taken_into_work_at !== null`) + `ActionButtons` (delete only)
- Background: `bg-blue-50` if `task.taken_into_work_at !== null` (taken into work, highlighted blue)

## Notes
- `qaTasksAtom` excludes tasks with `status = 'Завершена'` (TS review fix)
- Delete period triggers `ConfirmDialog` with message "Будут удалены все задачи периода (N шт.)" where N = total tasks in that period across ALL atoms (not just QA tasks)
- After confirming delete, call `deletePeriodAtom(id)`
