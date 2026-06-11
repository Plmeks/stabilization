# Task 1.4: Supabase Data Access Layer

## Related Use Cases
- UC-1: Create Period
- UC-2: Add QA Task
- UC-3: Take Into Work
- UC-4: Edit Task
- UC-5: Complete Task
- UC-6: Return to Work
- UC-7: View & Lock Stats
- UC-8: Delete Task
- UC-9: Delete Period

## Goal
Create a typed Supabase client and all CRUD/mutation functions used by Jotai atoms.

## Changes

### New Files

#### `src/lib/supabase/client.ts`
- Export a singleton Supabase client created with `createClient(url, anonKey)` from `@supabase/supabase-js`
- Read URL and key from `process.env.NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Export type `Database` (can be a simple type alias; full Supabase gen types optional)

#### `src/lib/supabase/dal.ts`
All functions are `async` and return typed values. Throw on error (let Jotai atoms catch).

**Period functions:**
- `fetchPeriods(): Promise<Period[]>` — SELECT all, ORDER BY `start_date DESC`
- `createPeriod(input: CreatePeriodInput): Promise<Period>` — INSERT, return created row
- `deletePeriod(id: string): Promise<void>` — DELETE by id (cascade handles tasks)

**Task functions:**
- `fetchTasks(): Promise<Task[]>` — SELECT all tasks
- `createTask(input: CreateTaskInput): Promise<Task>` — INSERT with `status = 'Бэклог'`
- `takeIntoWork(id: string, input: TakeIntoWorkInput): Promise<Task>` — UPDATE: set `taken_into_work_at = now()`, merge `input` fields
- `updateTask(id: string, input: UpdateTaskInput): Promise<Task>` — UPDATE specified fields
- `completeTask(id: string, input: CompletionInput): Promise<Task>` — UPDATE: `status = 'Завершена'`, `completed_at = now()`, `period_id = input.period_id`
- `returnTaskToWork(id: string, input: UpdateTaskInput): Promise<Task>` — UPDATE: `completed_at = null`, merge `input` fields
- `deleteTask(id: string): Promise<void>` — DELETE by id

**Stats function:**
- `lockMetrics(periodId: string, snapshot: MetricsSnapshot): Promise<Period>` — UPDATE `periods` set `metrics_snapshot = snapshot`, `metrics_locked_at = now()`

#### `src/lib/utils.ts`
- `formatPeriodLabel(period: Period): string` — returns "DD.MM - DD.MM.YYYY" using dayjs
- `detectUrls(text: string): Array<{ text: string; url?: string }>` — splits text into plain and URL segments for `TaskTitle` component
- `isTaskActive(task: Task): boolean` — returns `task.taken_into_work_at !== null && task.status !== 'Завершена'`
- `isTaskCompleted(task: Task): boolean` — returns `task.status === 'Завершена'`

## Notes
- All DAL functions are plain async functions, not React hooks
- They are called exclusively from Jotai write atoms
- No error suppression — let errors bubble up for UI error handling
