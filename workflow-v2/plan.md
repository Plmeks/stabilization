# Development Plan: Task Management App Refactor

## Overview

Refactoring of the existing Next.js task management app: new status logic, statistics table with lock/edit mechanics, direct "take into work" action (no modal), "return to QA" bug fix, and a modern design update.

Stack: Next.js 16 + Supabase + Jotai + Tailwind CSS v4 + shadcn/ui. No tests required.

---

## Task Execution Sequence

### Phase 1: Foundation — DB Migration & Type System

- **Task 1.1** — DB migration + types + constants
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7
  - Description file: `tasks/task-1-1.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes (no other tasks yet)

- **Task 1.2** — DAL refactor (task mutations + period_statistics CRUD)
  - Use Cases: UC-3, UC-4, UC-6, UC-7
  - Description file: `tasks/task-1-2.md`
  - Priority: Critical
  - Dependencies: task-1-1
  - Parallelizable: no (only task at this level)

---

### Phase 2: State Management Refactor

- **Task 2.1** — Tasks atom + utils refactor (filter logic, takeIntoWork, returnToQA)
  - Use Cases: UC-1, UC-3, UC-4, UC-5
  - Description file: `tasks/task-2-1.md`
  - Priority: Critical
  - Dependencies: task-1-2
  - Parallelizable: yes (with task-2-2, different files)

- **Task 2.2** — New statsAtom (period_statistics state & actions)
  - Use Cases: UC-6, UC-7
  - Description file: `tasks/task-2-2.md`
  - Priority: High
  - Dependencies: task-1-2
  - Parallelizable: yes (with task-2-1, different files)

---

### Phase 3: Statistics Feature

- **Task 3.1** — Stats page + StatsPeriodCard + LockMetricsButton + DataLoader
  - Use Cases: UC-6, UC-7
  - Description file: `tasks/task-3-1.md`
  - Priority: High
  - Dependencies: task-2-1, task-2-2
  - Parallelizable: no (depends on both 2.1 and 2.2)

- **Task 3.2** — EditMetricsModal (new component)
  - Use Cases: UC-7
  - Description file: `tasks/task-3-2.md`
  - Priority: High
  - Dependencies: task-3-1
  - Parallelizable: no (depends on StatsPeriodCard from 3.1)

---

### Phase 4: QA Tab — Take Into Work Refactor

- **Task 4.1** — Remove TakeIntoWorkModal + QA page + QATaskListItem update
  - Use Cases: UC-1, UC-2, UC-3
  - Description file: `tasks/task-4-1.md`
  - Priority: High
  - Dependencies: task-2-1
  - Parallelizable: yes (with task-5-1, different files)

---

### Phase 5: Return to QA Fix

- **Task 5.1** — ActionButtons fix + Current tab return to QA
  - Use Cases: UC-4
  - Description file: `tasks/task-5-1.md`
  - Priority: High
  - Dependencies: task-2-1
  - Parallelizable: yes (with task-4-1, different files)

- **Task 5.2** — Completed tab return to QA
  - Use Cases: UC-4
  - Description file: `tasks/task-5-2.md`
  - Priority: High
  - Dependencies: task-5-1
  - Parallelizable: no (depends on refactored ActionButtons from task-5-1)

---

### Phase 6: Design Refresh

- **Task 6.1** — Navigation + layout + page-level spacing redesign
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7
  - Description file: `tasks/task-6-1.md`
  - Priority: Medium
  - Dependencies: task-4-1, task-5-2, task-3-2
  - Parallelizable: yes (with task-6-2, different files)

- **Task 6.2** — Badges + tables + modals + stats components redesign
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7
  - Description file: `tasks/task-6-2.md`
  - Priority: Medium
  - Dependencies: task-4-1, task-5-2, task-3-2
  - Parallelizable: yes (with task-6-1, different files)

---

## Use Case Coverage

| Use Case | Tasks |
|----------|-------|
| UC-1: QA tab shows all tasks, no status badge, Авария marker | 1.1, 2.1, 4.1, 6.1, 6.2 |
| UC-2: Create task with null status, critical flag | 1.1, 4.1 |
| UC-3: Take into work — direct action, no modal | 1.1, 1.2, 2.1, 4.1 |
| UC-4: Return to QA — reset fields, keep priority, fix bug | 1.2, 2.1, 5.1, 5.2 |
| UC-5: Tab filtering by status | 1.1, 2.1 |
| UC-6: Lock period metrics into period_statistics | 1.1, 1.2, 2.2, 3.1 |
| UC-7: Edit locked metrics via modal | 2.2, 3.1, 3.2 |

---

## File Change Index

| File | Task(s) | Action |
|------|---------|--------|
| `supabase/migrations/003_period_statistics.sql` | 1.1 | CREATE |
| `src/types/constants.ts` | 1.1 | UPDATE |
| `src/types/index.ts` | 1.1 | UPDATE |
| `src/lib/supabase/dal.ts` | 1.2 | UPDATE |
| `src/lib/utils.ts` | 2.1 | UPDATE |
| `src/atoms/tasksAtom.ts` | 2.1 | UPDATE |
| `src/atoms/statsAtom.ts` | 2.2 | CREATE |
| `src/components/layout/DataLoader.tsx` | 3.1 | UPDATE |
| `src/app/stats/page.tsx` | 3.1 | UPDATE |
| `src/components/stats/StatsPeriodCard.tsx` | 3.1, 3.2 | UPDATE |
| `src/components/stats/LockMetricsButton.tsx` | 3.1 | UPDATE |
| `src/components/modals/EditMetricsModal.tsx` | 3.2 | CREATE |
| `src/components/modals/TakeIntoWorkModal.tsx` | 4.1 | DELETE |
| `src/app/qa/page.tsx` | 4.1 | UPDATE |
| `src/components/qa/QAPeriodSection.tsx` | 4.1 | UPDATE |
| `src/components/qa/QATaskListItem.tsx` | 4.1 | UPDATE |
| `src/components/shared/ActionButtons.tsx` | 5.1 | UPDATE |
| `src/components/current/CurrentTasksRow.tsx` | 5.1 | UPDATE |
| `src/components/current/CurrentTasksTable.tsx` | 5.1 | UPDATE |
| `src/app/current/page.tsx` | 5.1 | UPDATE |
| `src/components/completed/CompletedTasksRow.tsx` | 5.2 | UPDATE |
| `src/components/completed/CompletedTasksTable.tsx` | 5.2 | UPDATE |
| `src/app/completed/page.tsx` | 5.2 | UPDATE |
| `src/components/layout/TabNavigation.tsx` | 6.1 | UPDATE |
| `src/components/shared/PeriodAccordion.tsx` | 6.1 | UPDATE |
| `src/app/layout.tsx` | 6.1 | UPDATE |
| `src/components/shared/StatusBadge.tsx` | 6.2 | UPDATE |
| `src/components/shared/PriorityBadge.tsx` | 6.2 | UPDATE |
| `src/components/shared/PeriodBadge.tsx` | 6.2 | UPDATE |
| `src/components/shared/ModalWrapper.tsx` | 6.2 | UPDATE |
| `src/components/stats/StatsMetricItem.tsx` | 6.2 | UPDATE |
