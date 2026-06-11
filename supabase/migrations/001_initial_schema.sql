-- Migration 001: Initial Schema
-- Creates periods and tasks tables with indexes and constraints

CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  metrics_snapshot JSONB,
  metrics_locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE INDEX idx_tasks_period_id ON tasks(period_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_taken_into_work_at ON tasks(taken_into_work_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
