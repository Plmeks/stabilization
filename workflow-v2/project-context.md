# Project Context: Stability Task Management App

**Documentation directory:** Not specified

This is an enhancement to an existing Next.js application for team task management.

---

## Project Overview

A task management web application for tracking work periods and tasks. Built with Next.js 16 (App Router), Supabase (PostgreSQL), Jotai for state management, Tailwind CSS v4, and shadcn/ui components.

**Deployment:** Vercel

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **State Management**: Jotai (atomic state)
- **Language**: TypeScript
- **Package Manager**: pnpm

---

## Current Database Schema

### Table: `periods`

Work periods with date ranges.

```sql
CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  metrics_snapshot JSONB,               -- TO BE REMOVED in migration 003
  metrics_locked_at TIMESTAMPTZ,        -- TO BE REMOVED in migration 003
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `tasks`

Tasks linked to periods.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  assignee TEXT,
  priority TEXT CHECK (priority IN ('Авария', 'Нормальный', 'Некритичный')),
  status TEXT NOT NULL DEFAULT 'Бэклог' CHECK (...),  -- TO BE CHANGED to nullable
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  taken_into_work_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

**Indexes:** `period_id`, `status`, `priority`, `taken_into_work_at`, `completed_at`

**Note:** The `status` field is currently NOT NULL with default `'Бэклог'`. Migration 003 will make it nullable and migrate existing `'Бэклог'` values to `null`.

---

## Current Application Structure

### Pages (App Router)

- `/src/app/page.tsx` — redirects to `/qa`
- `/src/app/layout.tsx` — root layout with Jotai Provider, TabNavigation, DataLoader
- `/src/app/qa/page.tsx` — QA / Новые задачи tab
- `/src/app/current/page.tsx` — Текущие задачи tab
- `/src/app/completed/page.tsx` — Выполненные tab
- `/src/app/stats/page.tsx` — Статистика tab

### State Management (Jotai Atoms)

- `/src/atoms/periodsAtom.ts` — periods state, fetch/create/delete with optimistic updates
- `/src/atoms/tasksAtom.ts` — tasks state, CRUD operations with optimistic updates, derived atoms for each tab (`qaTasksAtom`, `currentTasksAtom`, `completedTasksAtom`)
- `/src/atoms/uiAtom.ts` — UI state (expanded periods)

### Data Access Layer

- `/src/lib/supabase/client.ts` — Supabase client singleton
- `/src/lib/supabase/dal.ts` — CRUD functions for periods, tasks, metrics

### Types

- `/src/types/index.ts` — TypeScript types (`Period`, `Task`, input types)
- `/src/types/constants.ts` — Constants (`TASK_STATUSES`, `PRIORITIES`, `TAB_ROUTES`, color mappings)

### Components

**Layout:**
- `/src/components/layout/TabNavigation.tsx` — tab navigation bar
- `/src/components/layout/DataLoader.tsx` — initial data loader

**Shared:**
- `/src/components/shared/PeriodAccordion.tsx` — collapsible period section
- `/src/components/shared/StatusBadge.tsx`, `PriorityBadge.tsx`, `PeriodBadge.tsx` — badge components
- `/src/components/shared/ActionButtons.tsx` — edit/delete/return-to-QA buttons
- `/src/components/shared/TaskTitle.tsx` — task title with URL detection
- `/src/components/shared/DateRangePicker.tsx` — date range picker
- `/src/components/shared/PeriodSelector.tsx` — period dropdown
- `/src/components/shared/ModalWrapper.tsx` — modal wrapper
- `/src/components/shared/ConfirmDialog.tsx` — confirmation dialog

**Modals:**
- `/src/components/modals/CreatePeriodModal.tsx` — create period modal
- `/src/components/modals/AddTaskModal.tsx` — add task modal
- `/src/components/modals/TakeIntoWorkModal.tsx` — **TO BE DELETED** (no longer used)
- `/src/components/modals/EditTaskModal.tsx` — edit task modal
- `/src/components/modals/CompleteTaskModal.tsx` — complete task modal

**Tab-specific:**
- `/src/components/qa/QAPeriodSection.tsx`, `QATaskListItem.tsx` — QA tab
- `/src/components/current/CurrentTasksTable.tsx`, `CurrentTasksRow.tsx` — Current tasks tab
- `/src/components/completed/CompletedPeriodSection.tsx`, `CompletedTasksTable.tsx`, `CompletedTasksRow.tsx` — Completed tab
- `/src/components/stats/StatsPeriodCard.tsx`, `StatsMetricItem.tsx`, `LockMetricsButton.tsx` — Statistics tab

**UI Components (shadcn/ui):**
- `/src/components/ui/` — button, input, select, badge, table, dialog, popover, calendar, etc.

### Utilities

- `/src/lib/utils.ts` — utility functions (`formatPeriodLabel`, `detectUrls`, `isTaskActive`, `isTaskCompleted`)

---

## Current User Flow

1. **QA Tab (Новые задачи / QA):**
   - Shows all tasks grouped by period
   - "Добавить задачу" → opens modal to create task in selected period
   - "Взять в работу" → opens `TakeIntoWorkModal` (TO BE REMOVED) → task moves to "Текущие задачи"

2. **Текущие задачи Tab:**
   - Shows tasks with status IN ('Бэклог', 'В работе', 'В тесте', 'Блокер')
   - Table view with columns: title, assignee, priority, status, actions
   - Actions: edit (pencil icon), delete (trash icon)
   - "Завершить" button → opens completion modal → task moves to "Выполненные"

3. **Выполненные Tab:**
   - Shows tasks with status = 'Завершена'
   - Similar table view
   - Actions: edit, delete

4. **Статистика Tab:**
   - Shows metrics for each period
   - Metrics calculated dynamically from tasks
   - "Зафиксировать метрики" button (TO BE IMPLEMENTED with new logic)

---

## Existing Migrations

- `supabase/migrations/001_initial_schema.sql` — initial schema
- `supabase/migrations/002_fix_task_status_nullable.sql` — made `status` nullable, removed default

**Note:** Migration 002 conflicts with new requirements — migration 003 will supersede it.

---

## Key Design Patterns

- **Optimistic updates:** All mutations update Jotai atoms immediately, then sync with server
- **Grouped by periods:** Tasks are always displayed grouped by their period
- **Tab filtering:** Each tab shows a different filtered view of the same tasks dataset
- **Component composition:** Modals, badges, and UI elements are highly reusable

---

## Coding Standards

- **TypeScript strict mode**
- **Tailwind CSS for all styling** (no CSS modules or styled-components)
- **shadcn/ui components** for UI primitives
- **Jotai atoms** for state management (no Context API or Redux)
- **Server Actions are NOT used** (client-side Supabase calls only)
- **NO tests required** (per client request)

---

## Known Issues to be Fixed

1. Status logic does not match user's requirements (major refactor needed)
2. Statistics table needs separate database table with lock/edit functionality
3. Design is too cramped — needs modern IT-style redesign (wider spacing, thinner lines)
4. Bug: "Вернуть в QA" button throws errors
5. TakeIntoWorkModal should be removed (no longer needed)
