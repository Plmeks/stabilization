# Task 4.1: Remove TakeIntoWorkModal + QA Flow Refactor

## Related Use Cases
- UC-1: QA tab shows all tasks, no status badge shown
- UC-2: Task creation with null status (verify existing AddTaskModal behavior)
- UC-3: "Взять в работу" is direct action — no modal, only for tasks with `status === null`

## Task Goal

Delete `TakeIntoWorkModal`, update the QA page to call `takeIntoWorkAtom` directly, update `QAPeriodSection` and `QATaskListItem` to reflect the new direct-action pattern and correct visibility rules for the "Взять в работу" button. Remove the `StatusBadge` from QA task items.

## Description of Changes

### Deleted Files

- `src/components/modals/TakeIntoWorkModal.tsx` — **delete the entire file**

### Changes to Existing Files

#### File: `src/app/qa/page.tsx`

**Remove**:
- Import of `TakeIntoWorkModal`
- State variable `showTakeIntoWorkModal` (`useState<Task | null>(null)`)
- The `{showTakeIntoWorkModal && <TakeIntoWorkModal ... />}` JSX block

**Add**:
- Import `takeIntoWorkAtom` from `@/atoms/tasksAtom`
- `const takeIntoWork = useSetAtom(takeIntoWorkAtom)`

**Update `onTakeIntoWork` handler**:
- Old: `setShowTakeIntoWorkModal` (stored task in state to pass to modal)
- New: a function `handleTakeIntoWork = async (taskId: string) => { await takeIntoWork(taskId) }`
- Pass `handleTakeIntoWork` to `QAPeriodSection`'s `onTakeIntoWork` prop

**Update prop type passed to `QAPeriodSection`**:
- Change from `onTakeIntoWork: (task: Task) => void` to `onTakeIntoWork: (taskId: string) => void`

#### File: `src/components/qa/QAPeriodSection.tsx`

**Update `QAPeriodSectionProps` interface**:
- Change `onTakeIntoWork: (task: Task) => void` → `onTakeIntoWork: (taskId: string) => void`

**Update prop pass-through to `QATaskListItem`**:
- `onTakeIntoWork={onTakeIntoWork}` — stays the same expression, type now matches

**Remove `Task` type import** if no longer used (check: it's still used in `tasks: Task[]` prop, so keep it).

#### File: `src/components/qa/QATaskListItem.tsx`

**Update `QATaskListItemProps` interface**:
- Change `onTakeIntoWork: (task: Task) => void` → `onTakeIntoWork: (taskId: string) => void`

**Remove `<StatusBadge>` element**: Delete the `<StatusBadge status={task.status} />` line and its import.

**Fix "Взять в работу" button visibility**:
- Old condition: `const isTaken = task.taken_into_work_at !== null` → button hidden if `isTaken`
- New condition: button visible only if `task.status === null`
- Remove the `isTaken` variable
- New: `const canTakeIntoWork = task.status === null`
- Remove the `isTaken && 'bg-blue-50'` background highlight from the container div (no longer needed)

**Update button `onClick`**:
- Old: `onClick={() => onTakeIntoWork(task)}`
- New: `onClick={() => onTakeIntoWork(task.id)}`

**Keep `PriorityBadge`**: it is already displayed only when `task.priority === 'Авария'` — no change needed.

**Result**: The item renders title + optional Авария badge + "Взять в работу" button (only if status === null) + delete button. No status badge.

### Verify UC-2 (no code changes needed)

`AddTaskModal` already:
- Creates task with `createTaskAtom` which sets `status: null` in optimistic update
- Passes `priority: 'Авария'` when `isCritical` is checked
- Does NOT pass `status` in `CreateTaskInput` (DB default is now null after migration 003)

No code changes required for UC-2. Verification: after migration 003 is applied to the DB, new tasks will have `status = null` by default.

## Acceptance Criteria
- [ ] `TakeIntoWorkModal.tsx` file is deleted
- [ ] `qa/page.tsx` has no import or usage of `TakeIntoWorkModal`
- [ ] Clicking "Взять в работу" calls `takeIntoWorkAtom(taskId)` directly (no modal opens)
- [ ] "Взять в работу" button is only shown for tasks with `task.status === null`
- [ ] Tasks with any other status do NOT show the "Взять в работу" button
- [ ] `QATaskListItem` does not render `StatusBadge`
- [ ] `PriorityBadge` is still shown for `priority === 'Авария'`
- [ ] TypeScript compilation passes (no dead imports)

## Notes

- The `Task` type import in `QAPeriodSection` must stay (used for `tasks: Task[]`), but `Task` usage in the `onTakeIntoWork` signature is removed.
- Deleting `TakeIntoWorkModal.tsx` must not cause any remaining import to fail — double-check: it's only imported in `qa/page.tsx` (confirmed from codebase review).
- The blue background highlight (`bg-blue-50` on taken tasks) in `QATaskListItem` is removed as it was based on `isTaken` state. Visual distinction for in-progress tasks in the QA tab is no longer needed per the TS (QA shows all tasks uniformly).
