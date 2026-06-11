# Task 1.3: TypeScript Types & Constants

## Related Use Cases
- All use cases (shared foundation)

## Goal
Define all TypeScript types, enums, and constants used across the entire application.

## Changes

### New Files

#### `src/types/index.ts`

**Type `Period`:**
```ts
{
  id: string
  start_date: string        // ISO date "YYYY-MM-DD"
  end_date: string          // ISO date "YYYY-MM-DD"
  metrics_snapshot: MetricsSnapshot | null
  metrics_locked_at: string | null
  created_at: string
}
```

**Type `MetricsSnapshot`:**
```ts
{
  in_progress: number
  in_testing: number
}
```

**Type `Task`:**
```ts
{
  id: string
  title: string
  period_id: string
  assignee: string | null
  priority: Priority | null
  status: TaskStatus
  created_at: string
  taken_into_work_at: string | null
  completed_at: string | null
}
```

**Type `CreatePeriodInput`:**
```ts
{ start_date: string; end_date: string }
```

**Type `CreateTaskInput`:**
```ts
{ title: string; period_id: string }
```

**Type `TakeIntoWorkInput`:**
```ts
{ assignee?: string; priority?: Priority; status?: TaskStatus }
```

**Type `UpdateTaskInput`:**
```ts
{ assignee?: string; priority?: Priority | null; status?: TaskStatus }
```

**Type `CompletionInput`:**
```ts
{ period_id: string }
```

#### `src/types/constants.ts`

**`TASK_STATUSES`** — tuple of all valid status strings: `['Бэклог', 'В работе', 'В тесте', 'Завершена', 'Блокер']`

**`PRIORITIES`** — tuple: `['Авария', 'Нормальный', 'Некритичный']`

**`TAB_ROUTES`** — object mapping tab keys to paths:
```ts
{ qa: '/qa', current: '/current', completed: '/completed', stats: '/stats' }
```

**`PRIORITY_COLORS`** — object mapping priority to Tailwind classes for badge styling

**`STATUS_COLORS`** — object mapping status to Tailwind classes for badge styling

**Type aliases:**
- `TaskStatus = typeof TASK_STATUSES[number]`
- `Priority = typeof PRIORITIES[number]`
