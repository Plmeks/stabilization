# Development Plan: Team Task Management Web App

## Tech Decisions
- **UI Library:** shadcn/ui (Tailwind-native, lightweight, customizable)
- **Routing:** App Router with distinct routes `/qa`, `/current`, `/completed`, `/stats`
- **State:** Jotai atoms, optimistic updates (no waiting for server response on mutations)
- **Stats "Добавлено в беклог":** counted by `created_at` within period date range (TS review fix)
- **QA tab filter:** hides completed tasks (`status = 'Завершена'`)
- **Default status on "Взять в работу":** "В работе" (TS review fix)
- **Cascade delete:** `ON DELETE CASCADE` for `tasks.period_id`

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               # redirect → /qa
│   ├── qa/page.tsx
│   ├── current/page.tsx
│   ├── completed/page.tsx
│   └── stats/page.tsx
├── components/
│   ├── layout/
│   │   └── TabNavigation.tsx
│   ├── shared/
│   │   ├── ModalWrapper.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── PeriodAccordion.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PeriodBadge.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── PeriodSelector.tsx
│   │   ├── TaskTitle.tsx
│   │   └── ActionButtons.tsx
│   ├── modals/
│   │   ├── CreatePeriodModal.tsx
│   │   ├── AddTaskModal.tsx
│   │   ├── TakeIntoWorkModal.tsx
│   │   ├── EditTaskModal.tsx
│   │   └── CompleteTaskModal.tsx
│   ├── qa/
│   │   ├── QAPeriodSection.tsx
│   │   └── QATaskListItem.tsx
│   ├── current/
│   │   ├── CurrentTasksTable.tsx
│   │   └── CurrentTasksRow.tsx
│   ├── completed/
│   │   ├── CompletedPeriodSection.tsx
│   │   ├── CompletedTasksTable.tsx
│   │   └── CompletedTasksRow.tsx
│   └── stats/
│       ├── StatsPeriodCard.tsx
│       ├── StatsMetricItem.tsx
│       └── LockMetricsButton.tsx
├── atoms/
│   ├── periodsAtom.ts
│   ├── tasksAtom.ts
│   └── uiAtom.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── dal.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## Task Execution Sequence

### Phase 1: Infrastructure & Foundation

- **Task 1.1** — Next.js Project Initialization
  - Use Cases: UC-10
  - Description file: `tasks/task-1-1.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: no

- **Task 1.2** — Database Schema & Supabase Setup
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7, UC-8, UC-9
  - Description file: `tasks/task-1-2.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes (can run in parallel with task-1-1)

- **Task 1.3** — TypeScript Types & Constants
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7, UC-8, UC-9, UC-10, UC-11
  - Description file: `tasks/task-1-3.md`
  - Priority: Critical
  - Dependencies: task-1-1
  - Parallelizable: yes

- **Task 1.4** — Supabase Data Access Layer
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7, UC-8, UC-9
  - Description file: `tasks/task-1-4.md`
  - Priority: Critical
  - Dependencies: task-1-1, task-1-2, task-1-3
  - Parallelizable: no

- **Task 1.5** — Jotai Atoms & State Management
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-6, UC-7, UC-8, UC-9
  - Description file: `tasks/task-1-5.md`
  - Priority: Critical
  - Dependencies: task-1-3, task-1-4
  - Parallelizable: no

---

### Phase 2: Layout & Navigation

- **Task 2.1** — Root Layout & Tab Navigation
  - Use Cases: UC-10
  - Description file: `tasks/task-2-1.md`
  - Priority: Critical
  - Dependencies: task-1-1, task-1-3
  - Parallelizable: no

---

### Phase 3: Shared UI Components

- **Task 3.1** — ModalWrapper & ConfirmDialog
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5, UC-8, UC-9
  - Description file: `tasks/task-3-1.md`
  - Priority: High
  - Dependencies: task-1-1
  - Parallelizable: yes

- **Task 3.2** — PeriodAccordion
  - Use Cases: UC-1, UC-11
  - Description file: `tasks/task-3-2.md`
  - Priority: High
  - Dependencies: task-1-3
  - Parallelizable: yes

- **Task 3.3** — PriorityBadge, StatusBadge & PeriodBadge
  - Use Cases: UC-3, UC-4, UC-5, UC-7
  - Description file: `tasks/task-3-3.md`
  - Priority: High
  - Dependencies: task-1-3
  - Parallelizable: yes

- **Task 3.4** — DateRangePicker & PeriodSelector
  - Use Cases: UC-1, UC-2, UC-5
  - Description file: `tasks/task-3-4.md`
  - Priority: High
  - Dependencies: task-1-3
  - Parallelizable: yes

- **Task 3.5** — TaskTitle (URL Detection)
  - Use Cases: UC-2
  - Description file: `tasks/task-3-5.md`
  - Priority: Medium
  - Dependencies: task-1-1
  - Parallelizable: yes

- **Task 3.6** — ActionButtons
  - Use Cases: UC-4, UC-8
  - Description file: `tasks/task-3-6.md`
  - Priority: Medium
  - Dependencies: task-1-1
  - Parallelizable: yes

---

### Phase 4: Feature Modals

- **Task 4.1** — CreatePeriodModal
  - Use Cases: UC-1
  - Description file: `tasks/task-4-1.md`
  - Priority: High
  - Dependencies: task-3-1, task-3-4, task-1-5
  - Parallelizable: yes

- **Task 4.2** — AddTaskModal
  - Use Cases: UC-2
  - Description file: `tasks/task-4-2.md`
  - Priority: High
  - Dependencies: task-3-1, task-3-4, task-1-5
  - Parallelizable: yes

- **Task 4.3** — TakeIntoWorkModal
  - Use Cases: UC-3
  - Description file: `tasks/task-4-3.md`
  - Priority: High
  - Dependencies: task-3-1, task-3-3, task-1-5
  - Parallelizable: yes

- **Task 4.4** — EditTaskModal
  - Use Cases: UC-4, UC-6
  - Description file: `tasks/task-4-4.md`
  - Priority: High
  - Dependencies: task-3-1, task-3-3, task-3-4, task-1-5
  - Parallelizable: yes

- **Task 4.5** — CompleteTaskModal
  - Use Cases: UC-5
  - Description file: `tasks/task-4-5.md`
  - Priority: High
  - Dependencies: task-3-1, task-3-4, task-1-5
  - Parallelizable: yes

---

### Phase 5: Tab Pages

- **Task 5.1** — QA Tab Page
  - Use Cases: UC-2, UC-3, UC-8, UC-9, UC-11
  - Description file: `tasks/task-5-1.md`
  - Priority: High
  - Dependencies: task-2-1, task-3-2, task-3-5, task-3-6, task-4-1, task-4-2, task-4-3, task-1-5
  - Parallelizable: yes

- **Task 5.2** — Current Tasks Tab Page
  - Use Cases: UC-3, UC-4, UC-5, UC-8
  - Description file: `tasks/task-5-2.md`
  - Priority: High
  - Dependencies: task-2-1, task-3-3, task-3-5, task-3-6, task-4-4, task-4-5, task-1-5
  - Parallelizable: yes

- **Task 5.3** — Completed Tasks Tab Page
  - Use Cases: UC-6, UC-8, UC-11
  - Description file: `tasks/task-5-3.md`
  - Priority: High
  - Dependencies: task-2-1, task-3-2, task-3-3, task-3-5, task-3-6, task-4-4, task-1-5
  - Parallelizable: yes

- **Task 5.4** — Statistics Tab Page
  - Use Cases: UC-7
  - Description file: `tasks/task-5-4.md`
  - Priority: High
  - Dependencies: task-2-1, task-1-5
  - Parallelizable: yes

---

### Phase 6: Deployment

- **Task 6.1** — Vercel Deployment Configuration
  - Use Cases: all
  - Description file: `tasks/task-6-1.md`
  - Priority: High
  - Dependencies: task-5-1, task-5-2, task-5-3, task-5-4
  - Parallelizable: no

---

## Use Case Coverage

| Use Case | Tasks |
|----------|-------|
| UC-1: Create Period | 1.2, 1.3, 1.4, 1.5, 3.2, 3.4, 4.1, 5.1 |
| UC-2: Add QA Task | 1.2, 1.3, 1.4, 1.5, 3.4, 3.5, 4.2, 5.1 |
| UC-3: Take Into Work | 1.2, 1.3, 1.4, 1.5, 3.3, 4.3, 5.1, 5.2 |
| UC-4: Edit Task | 1.4, 1.5, 3.3, 3.6, 4.4, 5.2, 5.3 |
| UC-5: Complete Task | 1.4, 1.5, 3.4, 4.5, 5.2 |
| UC-6: Return to Work | 1.4, 1.5, 4.4, 5.3 |
| UC-7: View & Lock Stats | 1.2, 1.4, 1.5, 3.3, 5.4 |
| UC-8: Delete Task | 1.4, 1.5, 3.6, 5.1, 5.2, 5.3 |
| UC-9: Delete Period | 1.2, 1.4, 1.5, 5.1 |
| UC-10: Tab Navigation | 1.1, 1.3, 2.1 |
| UC-11: Collapse/Expand Periods | 1.5, 3.2, 5.1, 5.3 |
