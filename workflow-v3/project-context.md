# Project Context: Stability Management Application

## Project Overview

**Name:** stability  
**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Jotai (state), Supabase (PostgreSQL), shadcn/ui  
**Package Manager:** pnpm  
**Deployment:** Vercel

**Purpose:** Internal team task management system for tracking stability-related tasks across sprint periods (QA, current tasks, completed tasks, statistics).

## Documentation Directory

Not specified (no docs_dir provided).

## Current Database Schema

### Tables:

1. **periods** - Sprint/time periods
   - `id`, `start_date`, `end_date`, `created_at`

2. **tasks** - Individual tasks
   - `id`, `title`, `period_id`, `assignee`, `priority`, `status`, `created_at`, `taken_into_work_at`, `completed_at`, `link`
   - **Priorities:** 'Авария' (critical), 'Нормальный', 'Некритичный'
   - **Statuses:** null (QA/backlog), 'В работе', 'В тесте', 'Завершена', 'Блокер'

3. **period_statistics** - Locked metrics snapshots per period
   - `id`, `period_id`, `added_to_backlog`, `added_critical`, `resolved_total`, `resolved_critical`, `in_progress`, `in_testing`, `locked_at`, `created_at`

## Current Application Structure

### Four Main Tabs:
1. **Новые задачи / QA** (`/qa`) - All tasks, grouped by period
2. **Текущие задачи** (`/current`) - Tasks with status in ('В работе', 'В тесте', 'Блокер')
3. **Выполненные** (`/completed`) - Tasks with status 'Завершена'
4. **Статистика** (`/stats`) - Period statistics (dynamic + locked snapshots)

### Key Behavioral Rules:
- Tasks start with `status = null` (in QA tab)
- "Take into work" moves task to "Текущие" with status "В работе"
- QA tab always shows ALL tasks (never filtered out)
- Statistics can be locked (saved snapshot) or dynamic (calculated)
- Period selection auto-fills when adding task from period accordion

### Current Statistics Implementation

**Dynamic metrics (calculated live):**
- `added_to_backlog` = tasks with `status !== null` for the period
- `added_critical` = tasks with `status !== null` AND `priority === 'Авария'`
- `resolved_total` = tasks with `status === 'Завершена'`
- `resolved_critical` = tasks with `status === 'Завершена'` AND `priority === 'Авария'`
- `in_progress` = tasks with `status === 'В работе'`
- `in_testing` = tasks with `status === 'В тесте'`

**Lock/Edit flow:**
- "Зафиксировать метрики" saves snapshot to `period_statistics` table
- "Редактировать" allows manual editing of locked metrics
- Delete button removes locked snapshot, reverts to dynamic

## State Management (Jotai)

- `periodsAtom` - all periods
- `tasksAtom` - all tasks
- `periodStatisticsAtom` - locked statistics snapshots
- Atoms provide CRUD operations with optimistic updates

## Key Files

- Migration: `supabase/migrations/001_create_tables.sql`
- Types: `src/types/index.ts`, `src/types/constants.ts`
- DAL: `src/lib/supabase/dal.ts`
- Stats Page: `src/app/stats/page.tsx`
- Stats Components: `src/components/stats/StatsPeriodCard.tsx`, `src/components/stats/StatsMetricItem.tsx`

## Design Principles

- Modern, spacious UI (Bitrix24/Vercel inspired)
- Pill-style badges (`rounded-full`)
- Horizontal scrollable tables with sticky Actions column
- Auto-expand most recent period in Completed tab
- Link field makes task titles clickable
