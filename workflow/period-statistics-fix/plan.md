# Development Plan: Dual Period ID for Multi-Period Task Tracking

## Overview

Replace the single `period_id` field on the `tasks` table with two fields:
- `creation_period_id` — immutable, set at creation, drives QA-tab grouping and "added" statistics
- `active_period_id` — mutable, updated on lifecycle transitions, drives WIP/resolved statistics and Completed-tab grouping

---

## Task Execution Sequence

### Phase 1: Foundation — Database, Types, DAL

- **Task 1.1** — Update database migration schema
  - Use Cases: UC-01 through UC-13 (foundation for all)
  - Description file: `tasks/task-1-1.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes (no shared files with task-1-2)

- **Task 1.2** — Update TypeScript types
  - Use Cases: UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-08, UC-09, UC-10, UC-11, UC-12, UC-13
  - Description file: `tasks/task-1-2.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes (no shared files with task-1-1)

- **Task 1.3** — Update DAL functions
  - Use Cases: UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-12
  - Description file: `tasks/task-1-3.md`
  - Priority: Critical
  - Dependencies: task-1-2
  - Parallelizable: no (depends on task-1-2)

### Phase 2: Core Logic — Statistics and State

- **Task 2.1** — Update statistics calculation logic
  - Use Cases: UC-08
  - Description file: `tasks/task-2-1.md`
  - Priority: Critical
  - Dependencies: task-1-2
  - Parallelizable: yes (no shared files with task-1-3)

- **Task 2.2** — Update tasks Jotai atom
  - Use Cases: UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-09, UC-10, UC-12
  - Description file: `tasks/task-2-2.md`
  - Priority: Critical
  - Dependencies: task-1-2, task-1-3
  - Parallelizable: no (depends on task-1-3)

- **Task 2.3** — Update periods Jotai atom (WIP transfer + pre-deletion reset)
  - Use Cases: UC-07, UC-12
  - Description file: `tasks/task-2-3.md`
  - Priority: Critical
  - Dependencies: task-1-3, task-2-2
  - Parallelizable: no (depends on task-2-2)

### Phase 3: UI Updates

- **Task 3.1** — Update QA page filtering and period-deletion dialog
  - Use Cases: UC-09, UC-12
  - Description file: `tasks/task-3-1.md`
  - Priority: High
  - Dependencies: task-2-2, task-2-3
  - Parallelizable: yes (no shared files with task-3-2, task-3-3, task-3-4)

- **Task 3.2** — Update Completed page grouping and CompletedTasksTable
  - Use Cases: UC-10
  - Description file: `tasks/task-3-2.md`
  - Priority: High
  - Dependencies: task-1-2, task-2-2
  - Parallelizable: yes (no shared files with task-3-1, task-3-3, task-3-4)

- **Task 3.3** — Update modals (AddTaskModal, EditTaskModal, CompleteTaskModal)
  - Use Cases: UC-01, UC-03, UC-05, UC-11
  - Description file: `tasks/task-3-3.md`
  - Priority: High
  - Dependencies: task-1-2, task-2-2
  - Parallelizable: yes (no shared files with task-3-1, task-3-2, task-3-4)

- **Task 3.4** — Add "Создана в периоде" column to Current Tasks table
  - Use Cases: UC-13
  - Description file: `tasks/task-3-4.md`
  - Priority: High
  - Dependencies: task-1-2, task-2-2
  - Parallelizable: yes (no shared files with task-3-1, task-3-2, task-3-3)

---

## Use Case Coverage

| Use Case | Tasks |
|----------|-------|
| UC-01: Create a New Task | 1-1, 1-2, 1-3, 2-2, 3-3 |
| UC-02: Take Task into Work | 1-1, 1-2, 1-3, 2-2 |
| UC-03: Complete a Task | 1-1, 1-2, 1-3, 2-2, 3-3 |
| UC-04: Return Task from Completed to QA | 1-1, 1-2, 1-3, 2-2 |
| UC-05: Return Task from Completed to Work | 1-1, 1-2, 1-3, 2-2, 3-3 |
| UC-06: Return Task from Current to QA | 1-1, 1-2, 1-3, 2-2 |
| UC-07: Create a New Period (WIP transfer) | 1-1, 1-3, 2-3 |
| UC-08: Calculate Dynamic Metrics | 1-1, 1-2, 2-1 |
| UC-09: Display Tasks on QA Tab | 1-2, 2-2, 3-1 |
| UC-10: Display Tasks on Completed Tab | 1-2, 2-2, 3-2 |
| UC-11: Edit Task Fields | 1-2, 3-3 |
| UC-12: Delete a Period | 1-3, 2-2, 2-3, 3-1 |
| UC-13: Display Creation Period on Current Tasks Tab | 1-2, 2-2, 3-4 |

---

## File Change Map

| File | Tasks |
|------|-------|
| `supabase/migrations/001_create_tables.sql` | 1-1 |
| `src/types/index.ts` | 1-2 |
| `src/lib/supabase/client.ts` | 1-2 |
| `src/lib/supabase/dal.ts` | 1-3 |
| `src/lib/stats-utils.ts` | 2-1 |
| `src/atoms/tasksAtom.ts` | 2-2 |
| `src/atoms/periodsAtom.ts` | 2-3 |
| `src/app/qa/page.tsx` | 3-1 |
| `src/app/completed/page.tsx` | 3-2 |
| `src/components/completed/CompletedTasksTable.tsx` | 3-2 |
| `src/components/modals/AddTaskModal.tsx` | 3-3 |
| `src/components/modals/EditTaskModal.tsx` | 3-3 |
| `src/components/modals/CompleteTaskModal.tsx` | 3-3 |
| `src/components/current/CurrentTasksTable.tsx` | 3-4 |
| `src/components/current/CurrentTasksRow.tsx` | 3-4 |
