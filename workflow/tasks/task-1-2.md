# Task 1.2: Database Schema & Supabase Setup

## Related Use Cases
- UC-1: Create Period
- UC-2: Add QA Task
- UC-3: Take Into Work
- UC-4: Edit Task
- UC-5: Complete Task
- UC-7: View & Lock Stats
- UC-8: Delete Task
- UC-9: Delete Period

## Goal
Create the Supabase project, run migrations to create `periods` and `tasks` tables with all required columns, indexes, and constraints.

## Changes

### New Files
- `supabase/migrations/001_initial_schema.sql` — full DDL

### Migration SQL Content

**Table `periods`:**
```sql
CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  metrics_snapshot JSONB,
  metrics_locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table `tasks`:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  assignee TEXT,
  priority TEXT CHECK (priority IN ('Авария', 'Нормальный', 'Некритичный')),
  status TEXT NOT NULL DEFAULT 'Бэклог' CHECK (status IN ('Бэклог', 'В работе', 'В тесте', 'Завершена', 'Блокер')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  taken_into_work_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
```sql
CREATE INDEX idx_tasks_period_id ON tasks(period_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_taken_into_work_at ON tasks(taken_into_work_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
```

### Supabase Setup Steps
1. Create a new Supabase project
2. Run the migration SQL in the Supabase SQL Editor
3. Copy `Project URL` and `anon public` API key into `.env.local`
4. In Supabase Dashboard → Settings → API → disable RLS on both tables (no auth in v1)

## Notes
- No RLS needed (no authentication in v1)
- `ON DELETE CASCADE` handles UC-9 cascade delete automatically
- `metrics_snapshot` shape: `{"in_progress": number, "in_testing": number}`
