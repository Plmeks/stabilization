# Project Context

**Documentation directory**: Not specified

## Project Overview

Stability is a task management application for tracking work periods and tasks, built with Next.js 16, Supabase (PostgreSQL), and deployed on Vercel.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **State Management**: Jotai (atomic state)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Current Database Schema

### Tables

1. **periods**
   - `id` (UUID, PK)
   - `start_date` (DATE)
   - `end_date` (DATE)
   - `created_at` (TIMESTAMPTZ)

2. **tasks**
   - `id` (UUID, PK)
   - `title` (TEXT)
   - `period_id` (UUID, FK → periods.id)
   - `assignee` (TEXT, nullable)
   - `priority` (TEXT, enum: 'Авария', 'Нормальный', 'Некритичный', nullable)
   - `status` (TEXT, enum: 'В работе', 'В тесте', 'Завершена', 'Блокер', nullable)
   - `created_at` (TIMESTAMPTZ)
   - `taken_into_work_at` (TIMESTAMPTZ, nullable)
   - `completed_at` (TIMESTAMPTZ, nullable)
   - `link` (TEXT, nullable)

3. **period_statistics**
   - `id` (UUID, PK)
   - `period_id` (UUID, UNIQUE FK → periods.id)
   - Period-specific metrics (added_to_backlog, added_critical, added_non_critical)
   - Resolved metrics (resolved_total, resolved_critical, resolved_non_critical)
   - WIP snapshot (in_progress, in_testing, in_block, wip_total)
   - Cumulative metrics (total_problems_cumulative, completed_cumulative, uncompleted, uncompleted_critical, uncompleted_non_critical)
   - `comment` (TEXT, nullable)
   - `locked_at` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)

### Migration Constraint

**CRITICAL**: All database schema changes MUST be consolidated into the single migration file:
`supabase/migrations/001_create_tables.sql`

This file is a complete, standalone schema definition. The user manually deletes all tables in Supabase before running this migration. Do NOT create incremental migration files.

## Application Architecture

### Task Lifecycle

1. **Creation (QA Tab)**: Tasks are created with `status = null`, `priority = null or specified`
2. **Take into Work**: Sets `status = 'В работе'`, `taken_into_work_at = now()`, defaults `priority` to 'Нормальный' if null
3. **Work Progress**: Can transition through statuses: 'В работе' → 'В тесте' → 'Завершена' or 'Блокер'
4. **Completion**: User selects a period for the completed task (via modal)
5. **Return to QA**: Sets `status = null`, clears `taken_into_work_at`, `completed_at`, `assignee`; retains `priority`

### Current Period Anchoring (THE PROBLEM)

**Issue**: Tasks have a single `period_id` field that references their creation period. This causes:
- Tasks created in Period A but worked on in Period B count towards Period A's statistics
- Tasks from Period A's backlog that are taken into work in Period B don't count in Period B's WIP
- Statistics become incorrect when work spans multiple periods

**User's Scenario**:
```
Period A (01.05.2026-07.05.2026):
  - 3 tasks created
  - 2 taken into work, 1 left in backlog
  - 1 completed, 1 still in work
  - Lock metrics: added_to_backlog=3, in_progress=1, resolved_total=1

Period B (09.05.2026-16.05.2026) starts:
  - Should have in_progress=1 (the task still in work from Period A)
  - If we take the backlog task from Period A into work, should have in_progress=2
  - BUT: Current architecture shows in_progress=0 for Period B because tasks are anchored to Period A
```

**User's Suggestions**:
1. Auto-transfer all unfinished tasks (WIP + backlog) from closed period to new period
   - **Con**: Loses backlog history in QA tab (can't see which period a task was originally created in)
2. Dual period IDs:
   - `creation_period_id` — tracks original creation period (for QA tab display)
   - `active_period_id` or `current_period_id` — tracks which period the task is active in (for statistics)

## Key Application Areas

### State Management (Jotai Atoms)

- `src/atoms/periodsAtom.ts` — period CRUD and derived state
- `src/atoms/tasksAtom.ts` — task CRUD, lifecycle actions (takeIntoWork, returnToQA), filtered views (qaTasksAtom, currentTasksAtom)
- `src/atoms/statsAtom.ts` — period_statistics CRUD, lock/unlock metrics, comment updates

### Data Access Layer

- `src/lib/supabase/dal.ts` — all Supabase queries (fetchPeriods, createTask, updateTask, deleteTask, returnTaskToQA, takeIntoWork, createPeriodStatistics, updatePeriodStatistics, etc.)

### Statistics Calculation

- `src/lib/stats-utils.ts` — `calculateDynamicMetrics(period, allPeriods, allTasks)` function
  - Computes all 15 metrics dynamically for a period
  - Used when period_statistics is not locked
  - Filters tasks by `period_id` for period-specific metrics
  - Uses cumulative logic for total_problems_cumulative, completed_cumulative

### UI Components

**Pages (Tabs)**:
- `src/app/qa/page.tsx` — "Новые задачи / QA" tab
- `src/app/current/page.tsx` — "Текущие задачи" tab
- `src/app/completed/page.tsx` — "Выполненные" tab
- `src/app/stats/page.tsx` — "Статистика" tab

**Key Components**:
- `src/components/qa/QAPeriodSection.tsx` — period accordion in QA tab
- `src/components/current/CurrentTasksTable.tsx` — table for current tasks
- `src/components/completed/CompletedTasksTable.tsx` — table for completed tasks
- `src/components/stats/StatsPeriodCard.tsx` — statistics display per period
- `src/components/modals/AddTaskModal.tsx` — create task modal
- `src/components/modals/EditTaskModal.tsx` — edit task modal
- `src/components/modals/CreatePeriodModal.tsx` — create period modal

## User Experience Requirements

### QA Tab Behavior
- Always show ALL tasks (never hide based on status)
- Group by creation period
- Highlight tasks with `status !== null` (taken into work)
- Show "Взять в работу" button only for tasks with `status === null`

### Current Tasks Tab
- Show tasks with `status IN ('В работе', 'В тесте', 'Блокер')`
- Display "Вернуть в QA" button (Undo2 icon)
- No delete button

### Completed Tasks Tab
- Show tasks with `status = 'Завершена'`
- Display "Вернуть в QA" button (Undo2 icon)
- No delete button

### Statistics Tab
- Display dynamic metrics (calculated real-time) OR locked metrics (from period_statistics table)
- "Зафиксировать метрики" button saves snapshot to period_statistics
- "Редактировать" button allows editing locked metrics
- Delete button removes locked snapshot (reverts to dynamic)
- Comment field with debounced auto-save

## Design Principles

- **Modern, spacious UI**: Inspired by Bitrix24, Supabase, Vercel
- **Pill badges**: `rounded-full px-2.5 py-0.5` for status, priority, period
- **Collapsible periods**: Accordion-like sections with expand/collapse all toggle
- **Responsive tables**: Horizontal scroll with sticky action columns
- **No excessive documentation**: Focus on code implementation
- **No tests**: User explicitly requested to skip tests

## Open Architectural Questions

### Return Task Scenario

**Question from user**: "Например взяли с периода старого в работу, нажали завершена, в новый период, а потом в таблице Завершенные я нажимаю кнпоку вернуть. Куда она вернется?"

When a task is returned from Completed tab:
- What should its `period_id` (or `active_period_id`) be?
- Should it return to its original creation period or the period it was last active in?
- How does this interact with the dual period ID solution?

This needs to be designed as part of the fix.
