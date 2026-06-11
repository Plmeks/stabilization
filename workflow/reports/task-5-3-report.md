# Task 5.3 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/completed/CompletedTasksRow.tsx` — table row for a completed task with `completed_at` date cell
- `src/components/completed/CompletedTasksTable.tsx` — table with "Дата завершения" header column
- `src/components/completed/CompletedPeriodSection.tsx` — `PeriodAccordion` wrapper (no add/delete buttons) around `CompletedTasksTable`

### Modified files:
- `src/app/completed/page.tsx` — replaced placeholder with full client component

## Implementation Details

### `src/app/completed/page.tsx`
- Client component reading `periodsAtom`, `completedTasksAtom`, `expandedPeriodsAtom`
- Groups completed tasks by `period_id`, filters to periods that have at least one completed task
- Periods sorted newest-first (by `start_date` descending)
- Manages `editingTask: Task | null` and `deletingTaskId: string | null` local state
- Renders `EditTaskModal` with `context="completed"` (triggers `returnTaskToWorkAtom` when status changes from "Завершена")
- Renders `ConfirmDialog` for delete confirmation

### `CompletedPeriodSection`
- Wraps `PeriodAccordion` with no `headerActions` prop (no add/delete period buttons)
- Passes through `tasks`, `periods`, `onEdit`, `onDelete` to `CompletedTasksTable`

### `CompletedTasksTable`
- Same column structure as described in task 5-2's `CurrentTasksTable` spec, but:
  - "Дата взятия" replaced by "Дата завершения" (`completed_at`)
- Period and date columns hidden on mobile (`hidden md:table-cell`)
- Uses a `Map` for O(1) period lookups

### `CompletedTasksRow`
- Renders `completed_at` formatted as `DD.MM.YYYY` via dayjs (shows "—" if null)

## Notes
- No tests per client request
- `deleteTask` awaited in page to properly manage `deleteLoading` state
- Empty state renders a localized message "Нет выполненных задач"
