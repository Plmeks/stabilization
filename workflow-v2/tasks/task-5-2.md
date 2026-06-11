# Task 5.2: Completed Tab Return to QA

## Related Use Cases
- UC-4: "Вернуть в QA" button in "Выполненные" tab resets status, taken_into_work_at, assignee; keeps priority

## Task Goal

Update the Completed tab components to use the new `onReturnToQA` prop from the refactored `ActionButtons` (task 5.1). Wire the return-to-QA and delete actions separately.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/completed/CompletedTasksRow.tsx`

**Update `CompletedTasksRowProps` interface**:
- Add `onReturnToQA: () => void`

**Update `ActionButtons` usage**:
- Pass `onReturnToQA={onReturnToQA}`
- Remove the `returnToQa` prop (deleted in task 5.1)
- `onDelete` stays — it remains a genuine delete action

#### File: `src/components/completed/CompletedTasksTable.tsx`

**Update `CompletedTasksTableProps` interface**:
- Add `onReturnToQA: (taskId: string) => void`

**Update `CompletedTasksRow` usage** (in the `.map()`):
- Pass `onReturnToQA={() => onReturnToQA(task.id)}`

#### File: `src/app/completed/page.tsx`

**Current situation**: The page passes `onDelete={setReturningTaskId}` to `CompletedPeriodSection`, which is the same pattern as the Current tab (delete callback used for return-to-QA). This must be corrected.

**Changes**:
- Rename existing `returningTaskId` / `setReturningTaskId` state to clearly handle return-to-QA (or keep name)
- Add separate delete state: `const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null)`
- Import `deleteTaskAtom` from `@/atoms/tasksAtom`
- Add delete handler
- Pass to `CompletedPeriodSection`:
  - `onDelete={setDeletingTaskId}` (actual delete)
  - `onReturnToQA={setReturningTaskId}` (return to QA)
- Add a second `ConfirmDialog` for delete confirmation

**Note**: Need to propagate `onReturnToQA` through `CompletedPeriodSection` as well.

#### File: `src/components/completed/CompletedPeriodSection.tsx`

**Update `CompletedPeriodSectionProps`**:
- Add `onReturnToQA: (taskId: string) => void`

**Pass through to `CompletedTasksTable`**:
- Pass `onReturnToQA={onReturnToQA}`

## Acceptance Criteria
- [ ] `CompletedTasksRow` uses `onReturnToQA` from updated `ActionButtons`
- [ ] `CompletedTasksTable` passes `onReturnToQA` through
- [ ] `CompletedPeriodSection` passes `onReturnToQA` through
- [ ] `completed/page.tsx` wires `onReturnToQA` to `returnToQAAtom` (with confirm dialog)
- [ ] `completed/page.tsx` wires `onDelete` to `deleteTaskAtom` (with confirm dialog)
- [ ] No TypeScript errors from the `returnToQa` prop removal
- [ ] TypeScript compilation passes

## Notes

- The `CompletedPeriodSection` component is a pass-through wrapper. Read the file before editing to confirm the exact prop propagation chain.
- The "return to QA" confirm dialog in the completed page can keep its existing message: "Задача будет возвращена в очередь QA. Статус и дата завершения будут сброшены."
