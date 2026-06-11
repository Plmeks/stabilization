# Task 5.3: Completed Tasks Tab Page

## Related Use Cases
- UC-6: Return to Work
- UC-8: Delete Task
- UC-11: Collapse/Expand Periods

## Goal
Build the "Выполненные" tab — completed tasks grouped by period in collapsible sections with edit/delete actions.

## Changes

### Modified Files

#### `src/app/completed/page.tsx`
- Client component
- Reads `periodsAtom`, `completedTasksAtom`, `expandedPeriodsAtom`
- State: `editingTask: Task | null`, `deletingTaskId: string | null`
- Layout:
  - List of `CompletedPeriodSection` for periods that have at least one completed task
  - Periods sorted newest first
  - `EditTaskModal` (context="completed") + `ConfirmDialog` for delete

### New Files

#### `src/components/completed/CompletedPeriodSection.tsx`
- Props:
  - `period: Period`
  - `tasks: Task[]` — completed tasks for this period
  - `isExpanded: boolean`
  - `onToggle: () => void`
  - `onEdit: (task: Task) => void`
  - `onDelete: (taskId: string) => void`
- Uses `PeriodAccordion` as wrapper (no add/delete period buttons)
- Body: `CompletedTasksTable`

#### `src/components/completed/CompletedTasksTable.tsx`
- Props: `tasks: Task[]`, `onEdit`, `onDelete`
- Same table structure as `CurrentTasksTable` but:
  - Replace "Дата взятия" column with "Дата завершения" (`completed_at`)
  - Show `CompletedTasksRow` rows

#### `src/components/completed/CompletedTasksRow.tsx`
- Props: `task: Task`, `onEdit`, `onDelete`
- Same as `CurrentTasksRow` but with `completed_at` date cell

## Notes
- `EditTaskModal` with `context="completed"` and status changed to non-"Завершена" triggers `returnTaskToWorkAtom`
- Only show periods that have at least one task in `completedTasksAtom`
