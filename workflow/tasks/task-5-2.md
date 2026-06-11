# Task 5.2: Current Tasks Tab Page

## Related Use Cases
- UC-3: Take Into Work (display)
- UC-4: Edit Task
- UC-5: Complete Task
- UC-8: Delete Task

## Goal
Build the "Текущие задачи" tab — a flat table of all active tasks (taken into work, not completed), with edit and delete actions.

## Changes

### Modified Files

#### `src/app/current/page.tsx`
- Client component
- Reads `currentTasksAtom` (tasks with `taken_into_work_at IS NOT NULL` and `status !== 'Завершена'`)
- State: `editingTask: Task | null`, `deletingTaskId: string | null`
- Layout:
  - Header: "Текущие задачи" title + count badge (total active tasks)
  - `CurrentTasksTable` component
  - `EditTaskModal` (context="current") + `ConfirmDialog` for delete

### New Files

#### `src/components/current/CurrentTasksTable.tsx`
- Props:
  - `tasks: Task[]`
  - `periods: Period[]` — for period label display
  - `onEdit: (task: Task) => void`
  - `onDelete: (taskId: string) => void`
- Renders an HTML `<table>` (or shadcn/ui `Table`) with columns:
  - **Задача** — `TaskTitle` component
  - **Исполнитель** — text or "—" if null
  - **Приоритет** — `PriorityBadge`
  - **Статус** — `StatusBadge`
  - **Период** — `PeriodBadge` (looked up from `periods` by `task.period_id`)
  - **Дата взятия** — formatted `taken_into_work_at` with dayjs "DD.MM.YYYY"
  - **Действия** — `ActionButtons` (edit + delete)
- Default sorting: by priority (Авария first), then by `taken_into_work_at` ascending
- Responsive: on mobile, hide less important columns (Период, Дата взятия)

#### `src/components/current/CurrentTasksRow.tsx`
- Props:
  - `task: Task`
  - `period: Period | undefined`
  - `onEdit: () => void`
  - `onDelete: () => void`
- Renders a single `<tr>` with all cells as described above
- Used internally by `CurrentTasksTable`

## Notes
- Priority sort order: "Авария" = 0, "Нормальный" = 1, "Некритичный" = 2, null = 3
- `EditTaskModal` with `context="current"` handles the "Завершена" → `CompleteTaskModal` flow
