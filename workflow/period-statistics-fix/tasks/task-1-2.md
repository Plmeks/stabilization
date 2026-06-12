# Task 1.2: Update TypeScript Types

## Related Use Cases
- UC-01: Create a New Task
- UC-02: Take Task into Work
- UC-03: Complete a Task
- UC-04: Return Task from Completed to QA
- UC-05: Return Task from Completed to Work
- UC-06: Return Task from Current to QA
- UC-08: Calculate Dynamic Metrics
- UC-09: Display Tasks on QA Tab
- UC-10: Display Tasks on Completed Tab
- UC-11: Edit Task Fields
- UC-12: Delete a Period
- UC-13: Display Creation Period on Current Tasks Tab

## Task Goal
Update all TypeScript types in `src/types/index.ts` to replace `period_id` with the two new period fields. Every layer of the application reads from the `Task` type; getting the types right here unblocks all subsequent tasks.

## Description of Changes

### Changed Files

#### File: `src/lib/supabase/client.ts`

The `Database` type in this file contains an inline `tasks.Row` definition that still declares `period_id`. Although this type is not currently imported or used anywhere else in the codebase, update it to match the schema to keep it accurate.

In the `tasks.Row` object, replace:
```ts
period_id: string;
```
With:
```ts
creation_period_id: string;
active_period_id: string;
```

All other rows in `periods.Row` and `period_statistics.Row` are unchanged. (`period_statistics.Row.period_id` references the `periods` table FK and is correct as-is.)

---

#### File: `src/types/index.ts`

**Type `Task`:**

Remove the field:
```ts
period_id: string;
```

Add two fields in its place (after `title`, same position as the old `period_id`):
```ts
creation_period_id: string;
active_period_id: string;
```

Both fields are non-nullable (`string`, not `string | null`) — the DB schema enforces NOT NULL for both.

**Type `CreateTaskInput`:**

Remove the field:
```ts
period_id: string;
```

Add:
```ts
creation_period_id: string;
```

Rationale: `active_period_id` is derived from `creation_period_id` at creation time (always equal). The DAL function `createTask` will set `active_period_id` internally without requiring the caller to provide it.

**Type `CompletionInput`:**

Remove the field:
```ts
period_id: string;
```

Add:
```ts
active_period_id: string;
```

Rationale: completing a task archives it under the user-selected period, which maps to `active_period_id`.

**Type `UpdateTaskInput`:** No changes. Period fields are never updated via this type; lifecycle transitions use dedicated DAL functions.

**All constants and other types** (`Period`, `PeriodStatistics`, `CreatePeriodInput`, `TaskStatus`, `Priority`, `TASK_STATUSES`, `PRIORITIES`, `TAB_ROUTES`, `PRIORITY_COLORS`, `STATUS_COLORS`): unchanged.

## Acceptance Criteria
- [ ] `Task.period_id` is removed; `Task.creation_period_id: string` and `Task.active_period_id: string` are present
- [ ] `CreateTaskInput.period_id` is removed; `CreateTaskInput.creation_period_id: string` is present
- [ ] `CompletionInput.period_id` is removed; `CompletionInput.active_period_id: string` is present
- [ ] `UpdateTaskInput` is unchanged
- [ ] `client.ts` `Database.tasks.Row` has `creation_period_id` and `active_period_id` (no `period_id`)
- [ ] TypeScript compiles without errors (after all other tasks are also done)

## Notes
This task creates compile errors in all files that currently reference `task.period_id`, `input.period_id`, or `CreateTaskInput.period_id`. Those errors are resolved by the downstream tasks (1-3, 2-2, 3-1, 3-2, 3-3, 3-4). Do not run the build until all tasks in Phase 1 and 2 are complete.
