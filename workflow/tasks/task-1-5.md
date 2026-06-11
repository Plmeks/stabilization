# Task 1.5: Jotai Atoms & State Management

## Related Use Cases
- All use cases (shared state foundation)

## Goal
Define all Jotai atoms. Atoms hold app data and expose write atoms that call DAL functions with optimistic updates.

## Changes

### New Files

#### `src/atoms/periodsAtom.ts`

**`periodsAtom`** — `atom<Period[]>([])` — holds all periods, sorted newest first

**`periodsLoadingAtom`** — `atom<boolean>(false)`

**`fetchPeriodsAtom`** — write atom that:
1. Sets `periodsLoadingAtom = true`
2. Calls `fetchPeriods()` from DAL
3. Sets `periodsAtom` with result
4. Sets `periodsLoadingAtom = false`

**`createPeriodAtom`** — write atom `(input: CreatePeriodInput)`:
1. Optimistically prepend a temp period to `periodsAtom`
2. Call `createPeriod(input)` 
3. Replace the temp period with the real one

**`deletePeriodAtom`** — write atom `(id: string)`:
1. Optimistically remove period from `periodsAtom`
2. Call `deletePeriod(id)`
3. On error, restore the period

#### `src/atoms/tasksAtom.ts`

**`tasksAtom`** — `atom<Task[]>([])` — holds all tasks

**`fetchTasksAtom`** — write atom that calls `fetchTasks()` and sets `tasksAtom`

**`createTaskAtom`** — write atom `(input: CreateTaskInput)`:
1. Optimistically add temp task to `tasksAtom`
2. Call `createTask(input)`
3. Replace temp with real task

**`takeIntoWorkAtom`** — write atom `(id: string, input: TakeIntoWorkInput)`:
1. Optimistically update task in `tasksAtom`
2. Call `takeIntoWork(id, input)`
3. On error, restore previous task state

**`updateTaskAtom`** — write atom `(id: string, input: UpdateTaskInput)`:
1. Optimistically update task
2. Call `updateTask(id, input)`
3. On error, restore

**`completeTaskAtom`** — write atom `(id: string, input: CompletionInput)`:
1. Optimistically update task: set status = 'Завершена', completed_at = now ISO string, period_id = input.period_id
2. Call `completeTask(id, input)`
3. On error, restore

**`returnTaskToWorkAtom`** — write atom `(id: string, input: UpdateTaskInput)`:
1. Optimistically update task: clear completed_at, set new status
2. Call `returnTaskToWork(id, input)`
3. On error, restore

**`deleteTaskAtom`** — write atom `(id: string)`:
1. Optimistically remove task from `tasksAtom`
2. Call `deleteTask(id)`
3. On error, restore

**`lockMetricsAtom`** — write atom `(periodId: string)`:
1. Compute snapshot: count tasks in `tasksAtom` with `isTaskActive(t)` AND status = 'В работе' / 'В тесте'
2. Call `lockMetrics(periodId, snapshot)`
3. Update period in `periodsAtom` with returned data

**Derived read atoms (computed, no DB calls):**

**`qaTasksAtom`** — derived: tasks where `status !== 'Завершена'` (hides completed from QA tab)

**`currentTasksAtom`** — derived: tasks where `isTaskActive(t)` is true

**`completedTasksAtom`** — derived: tasks where `isTaskCompleted(t)` is true

**`tasksByPeriodAtom`** — derived: `Record<string, Task[]>` grouped by `period_id`

#### `src/atoms/uiAtom.ts`

**`expandedPeriodsAtom`** — `atom<Set<string>>(new Set())` — set of period IDs currently expanded

**`togglePeriodExpansionAtom`** — write atom `(id: string)`: toggles presence in the set

**`initExpandedPeriodsAtom`** — write atom `(periods: Period[])`: sets the first (newest) period as expanded

## Notes
- Initial data load: call `fetchPeriodsAtom` and `fetchTasksAtom` once in the root layout or a top-level provider component
- Use `atomWithReset` from jotai/utils if needed for form state (optional)
- Optimistic updates use a temporary id like `temp-${Date.now()}` for new items
