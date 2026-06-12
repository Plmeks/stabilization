# Project Context: Stability Task Management System

## Documentation Directory
Not specified (no separate docs directory)

## Project Overview

**Stability** is a task management application for tracking work periods and tasks, built with Next.js, Supabase, and deployed on Vercel. The application manages tasks across different periods with detailed statistics and metrics.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **State Management**: Jotai (atomic state management)
- **Language**: TypeScript
- **Package Manager**: pnpm

## Database Schema

### Tables

1. **periods** - Work periods with date ranges
   - `id` (UUID, PK)
   - `start_date` (DATE)
   - `end_date` (DATE)
   - `created_at` (TIMESTAMP)

2. **tasks** - Tasks linked to periods
   - `id` (UUID, PK)
   - `creation_period_id` (UUID, FK to periods, CASCADE)
   - `active_period_id` (UUID, no FK)
   - `title` (TEXT)
   - `link` (TEXT, optional)
   - `priority` (TEXT: 'Критический', 'Нормальный', 'Некритичный')
   - `status` (TEXT, nullable: null, 'В работе', 'В тесте', 'Завершена', 'Блокер')
   - `assignee` (TEXT, optional)
   - `taken_into_work_at` (TIMESTAMP, optional)
   - `completed_at` (TIMESTAMP, optional)
   - `created_at` (TIMESTAMP)

3. **period_statistics** - Fixed statistics snapshots for periods
   - `id` (UUID, PK)
   - `period_id` (UUID, FK to periods, CASCADE)
   - Metrics: `added_to_backlog`, `added_critical`, `resolved_total`, `resolved_critical`, `in_progress`, `in_test`, `in_blocker`, `total_cumulative`, `completed_cumulative`, `remaining_cumulative`, `remaining_critical_cumulative`, `remaining_noncritical_cumulative`, `wip_cumulative`, `completed_this_period`, `completed_critical_this_period`, `completed_noncritical_this_period`, `added_this_period`, `added_critical_this_period`, `added_noncritical_this_period`
   - `comment` (TEXT, optional)
   - `created_at`, `updated_at` (TIMESTAMP)

## Application Structure

### Tabs (Main Navigation)

1. **Новые задачи / QA** (`/app/qa/page.tsx`)
   - Displays all tasks grouped by period
   - Tasks never disappear from this tab
   - Shows creation period and critical status
   - Edit functionality for title, link, and critical checkbox

2. **Текущие задачи** (`/app/current/page.tsx`)
   - Displays tasks with status: 'В работе', 'В тесте', 'Блокер'
   - Shows "Создана в периоде" column with creation period dates
   - Complete action button (green CircleCheck icon) for quick completion
   - Edit functionality

3. **Выполненные** (`/app/completed/page.tsx`)
   - Displays tasks with status: 'Завершена'
   - Grouped by `active_period_id`
   - Shows "Создана в периоде" column
   - Collapsible periods (accordion-like)

4. **Статистика** (`/app/statistics/page.tsx`)
   - Displays metrics for each period
   - Dynamic metrics (calculated in real-time) or fixed metrics (from `period_statistics` table)
   - "Зафиксировать метрики" button to save snapshot
   - "Редактировать" button for fixed metrics
   - "Удалить" button to remove fixed snapshot
   - 6-block metric structure with 15 total metrics
   - Collapsible periods

## Key Concepts

### Task Lifecycle

1. **Creation** - Task created in QA with `status = null`, assigned to `creation_period_id`
2. **Take into Work** - Status changes to 'В работе', `active_period_id` set to latest period
3. **In Test** - Status 'В тесте'
4. **Blocker** - Status 'Блокер'
5. **Completed** - Status 'Завершена', user selects period for completion
6. **Return to QA** - Status reset to `null`, `active_period_id` reset to `creation_period_id`

### Period IDs

- **creation_period_id** - The period when the task was created (never changes)
- **active_period_id** - The period where the task is currently active (changes as task moves through lifecycle)

### Statistics

- **Dynamic metrics** - Calculated in real-time from tasks (default)
- **Fixed metrics** - Saved snapshot in `period_statistics` table (after "Зафиксировать метрики")

Metrics include:
- Cumulative (total, completed, remaining, remaining critical/noncritical, WIP)
- Period-specific (completed this period, added this period)
- WIP (in progress, in test, in blocker)

### WIP Transfer

When a new period is created and it's the latest period by dates:
- All tasks with WIP statuses ('В работе', 'В тесте', 'Блокер') have their `active_period_id` updated to the new period
- This ensures statistics count ongoing work in the current period

## State Management (Jotai)

Key atoms:
- `periodsAtom` - All periods, sorted newest first
- `tasksAtom` - All tasks
- `statsAtom` - Period statistics snapshots
- `tasksByCreationPeriodAtom` - Tasks grouped by creation period
- `tasksByActivePeriodAtom` - Tasks grouped by active period

Write atoms for task lifecycle:
- `createTaskAtom`
- `takeIntoWorkAtom`
- `completeTaskAtom`
- `returnToQAAtom`
- `returnTaskToWorkAtom`
- `updateTaskAtom`

## Data Access Layer (DAL)

Located in `src/lib/supabase/dal.ts`:
- CRUD operations for tasks, periods, period_statistics
- `transferWipTasks(newPeriodId)` - Batch update WIP tasks to new period
- `resetActivePeriodForDeletion(periodId)` - Reset visiting tasks back to creation period

## UI Components

- Modal components: `AddTaskModal`, `EditTaskModal`, `EditQATaskModal`, `CompleteTaskModal`, `CreatePeriodModal`, `EditStatsModal`
- Shared components: `ActionButtons`, `ConfirmDialog`
- Tab-specific components for each main tab

## Design Aesthetics

- Modern, spacious design inspired by Bitrix24, Supabase, Vercel
- Pill badges for status and priority
- Increased paddings, thinner lines, rounded corners
- Horizontal scrolling tables with sticky columns
- Compact text for period dates: `DD.MM.YYYY - <br /> DD.MM.YYYY`

## Recent Changes

1. Renamed "Авария" to "Критический" everywhere
2. Added "Создана в периоде" column to Current and Completed tasks
3. Added edit icon to QA tasks
4. Added "Complete" action button to Current tasks
5. Implemented dual period ID architecture (creation_period_id + active_period_id)
6. Collapsible periods with "Развернуть все" / "Свернуть все" toggle

## Constraints

- **Medium flow**: Minimum documentation, focus on implementation
- **No tests**: Skip automated tests unless explicitly required
- **Single migration file**: `supabase/migrations/001_create_tables.sql` contains all schema (user deletes tables manually each time)
- **No authentication**: RLS disabled, all users can do everything

## Development Workflow

- Use pnpm for package management
- Run `pnpm dev` for development server
- Run `pnpm build` to verify build passes
- Use ReadLints to check for linter errors on modified files
- Follow existing code patterns (Jotai atoms, shadcn/ui components)
