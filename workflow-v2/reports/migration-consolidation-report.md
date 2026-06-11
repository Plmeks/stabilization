# Migration Consolidation Result

## Status
✅ Task completed successfully

## Changed Files

### Deleted files:
- `supabase/migrations/001_initial_schema.sql` — outdated initial schema
- `supabase/migrations/002_fix_task_status_nullable.sql` — merged into consolidated migration
- `supabase/migrations/003_period_statistics.sql` — merged into consolidated migration

### New files:
- `supabase/migrations/001_create_tables.sql` — single consolidated migration with final schema

## Schema Summary

### `periods` table
- `id`, `start_date`, `end_date`, `created_at`
- No `metrics_snapshot` or `metrics_locked_at` (removed as requested)

### `tasks` table
- `id`, `title`, `period_id` (FK → periods), `assignee`, `priority`, `status`, `created_at`, `taken_into_work_at`, `completed_at`
- `status`: nullable, no DEFAULT, CHECK constraint includes only: 'В работе', 'В тесте', 'Завершена', 'Блокер' (no 'Бэклог')
- `priority`: nullable, CHECK constraint: 'Авария', 'Нормальный', 'Некритичный'

### `period_statistics` table
- `id`, `period_id` (FK → periods, UNIQUE), `added_to_backlog`, `added_critical`, `resolved_total`, `resolved_critical`, `in_progress`, `in_testing`, `locked_at`, `created_at`

### Indexes
- `idx_tasks_period_id`, `idx_tasks_status`, `idx_tasks_priority`, `idx_tasks_taken_into_work_at`, `idx_tasks_completed_at`

## Notes
The migration is designed for a clean-slate workflow — drop all tables before running. No incremental ALTER statements needed.
