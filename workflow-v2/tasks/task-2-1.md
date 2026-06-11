# Task 2.1: Tasks Atom + Utils Refactor

## Related Use Cases
- UC-1: `qaTasksAtom` must return ALL tasks (no filter by status or completed_at)
- UC-3: `takeIntoWorkAtom` simplified to take only `id`
- UC-4: `returnToQAAtom` optimistic update must not reset priority
- UC-5: `currentTasksAtom` filters by status IN ('В работе', 'В тесте', 'Блокер')

## Task Goal

Update the Jotai tasks atom and utility functions to implement correct tab filtering logic, simplify the `takeIntoWork` action signature (no modal input), and fix the `returnToQA` optimistic update to not touch priority.

## Description of Changes

### Changes to Existing Files

#### File: `src/lib/utils.ts`

**Update `isTaskActive(task: Task): boolean`**:
- Old logic: `task.taken_into_work_at !== null && task.status !== 'Завершена'`
- New logic: `task.status === 'В работе' || task.status === 'В тесте' || task.status === 'Блокер'`
- This now purely checks status, not the timestamp field

**Update `isTaskCompleted(task: Task): boolean`**:
- Old logic: `task.status === 'Завершена'` — no change needed, keep as-is

#### File: `src/atoms/tasksAtom.ts`

**Update imports**:
- Remove `TakeIntoWorkInput` and `MetricsSnapshot` from the type import line
- Remove `lockMetrics` from the DAL import line
- Remove `periodsAtom` import (only used by the now-deleted `lockMetricsAtom`)
- Update `takeIntoWork` import from DAL (signature changed — no longer needs input type)

**Update `takeIntoWorkAtom`**:
- Change the write function signature from `{ id, input }: { id: string; input: TakeIntoWorkInput }` to just `id: string`
- Optimistic update: update the atom to set `status: 'В работе' as const`, `taken_into_work_at: new Date().toISOString()`, and `priority: task.priority ?? 'Нормальный' as const` (mirror the DAL logic)
- DAL call: `await takeIntoWork(id)` (no second argument)
- Error handling: revert to `previous` on failure — keep as-is

**Update `returnToQAAtom`**:
- Optimistic update: remove `priority: null` from the patch object. The object should only set: `status: null`, `taken_into_work_at: null`, `completed_at: null`, `assignee: null`
- DAL call and error handling remain unchanged

**Update `qaTasksAtom` (derived atom)**:
- Old: `get(tasksAtom).filter((t) => t.completed_at === null)`
- New: `get(tasksAtom)` — return the entire tasks array with no filter at all. QA tab shows ALL tasks.

**Update `currentTasksAtom` (derived atom)**:
- Old: `get(tasksAtom).filter((t) => isTaskActive(t))`
- New: same call `get(tasksAtom).filter((t) => isTaskActive(t))` — no change needed here because `isTaskActive` in utils.ts is being updated. The atom expression itself stays the same.

**Delete `lockMetricsAtom`**: Remove the entire atom definition and its associated imports.

**Note on `completeTaskAtom`**: This atom currently hard-codes `status: 'Завершена' as const` in the optimistic update, which is correct. No change needed.

### No changes to other atoms

`periodsAtom.ts`, `uiAtom.ts` — unaffected.

## Acceptance Criteria
- [ ] `qaTasksAtom` returns all tasks with no filtering
- [ ] `currentTasksAtom` returns only tasks with status `'В работе'`, `'В тесте'`, or `'Блокер'`
- [ ] `completedTasksAtom` returns only tasks with `status === 'Завершена'` (via updated `isTaskCompleted`)
- [ ] `takeIntoWorkAtom` accepts `id: string` only (no second argument)
- [ ] `takeIntoWorkAtom` optimistic update sets correct fields including conditional priority
- [ ] `returnToQAAtom` optimistic update does NOT modify `priority`
- [ ] `lockMetricsAtom` is deleted
- [ ] `isTaskActive` in utils.ts uses status-based check
- [ ] TypeScript compilation passes

## Notes

- After this task, `currentTasksAtom` will no longer show tasks with `status = null` (previously they appeared because `isTaskActive` checked `taken_into_work_at`). This is the correct behavior per UC-5.
- The `tasksByPeriodAtom` remains unchanged — it maps ALL tasks by period_id, which is correct for the QA tab (which shows all tasks).
- `returnTaskToWorkAtom` (used to un-complete a task back to active) is not changed by this task; it's separate from "return to QA".
