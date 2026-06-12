-- Create periods table
CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  creation_period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  active_period_id UUID NOT NULL,
  assignee TEXT,
  priority TEXT CHECK (priority IN ('Авария', 'Нормальный', 'Некритичный')),
  status TEXT CHECK (status IN ('В работе', 'В тесте', 'Завершена', 'Блокер')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  taken_into_work_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  link TEXT
);

-- Create period_statistics table
CREATE TABLE period_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL UNIQUE REFERENCES periods(id) ON DELETE CASCADE,

  -- Period-specific: Added
  added_to_backlog INTEGER NOT NULL,
  added_critical INTEGER NOT NULL,
  added_non_critical INTEGER NOT NULL,

  -- Period-specific: Resolved
  resolved_total INTEGER NOT NULL,
  resolved_critical INTEGER NOT NULL,
  resolved_non_critical INTEGER NOT NULL,

  -- WIP snapshot
  in_progress INTEGER NOT NULL,
  in_testing INTEGER NOT NULL,
  in_block INTEGER NOT NULL DEFAULT 0,
  wip_total INTEGER NOT NULL,

  -- Cumulative
  total_problems_cumulative INTEGER NOT NULL,
  completed_cumulative INTEGER NOT NULL,
  uncompleted INTEGER NOT NULL,
  uncompleted_critical INTEGER NOT NULL,
  uncompleted_non_critical INTEGER NOT NULL,

  -- Comment
  comment TEXT,

  -- Timestamps
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tasks_creation_period_id ON tasks(creation_period_id);
CREATE INDEX idx_tasks_active_period_id ON tasks(active_period_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_taken_into_work_at ON tasks(taken_into_work_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
