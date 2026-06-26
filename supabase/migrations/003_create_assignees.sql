-- Управляемый список исполнителей для выпадашки в задачах.
CREATE TABLE assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Первичное наполнение из уже использованных имён исполнителей.
INSERT INTO assignees (name)
SELECT DISTINCT TRIM(assignee)
FROM tasks
WHERE assignee IS NOT NULL AND TRIM(assignee) <> ''
ON CONFLICT (name) DO NOTHING;
