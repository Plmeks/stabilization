# Task 5.1: ActionButtons Fix + Current Tab Return to QA

## Related Use Cases
- UC-4: "Вернуть в QA" button in "Текущие задачи" tab resets status, taken_into_work_at, assignee; keeps priority

## Task Goal

Fix `ActionButtons` by separating the delete action and the return-to-QA action into distinct buttons with distinct callbacks. Update the Current tasks table and page to wire the return-to-QA callback correctly.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/shared/ActionButtons.tsx`

**Update component interface**:
```typescript
interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete: () => void;
  onReturnToQA?: () => void;  // NEW — separate callback
  disabled?: boolean;
  // remove: returnToQa?: boolean
}
```

**Remove `returnToQa` boolean prop entirely**.

**Update JSX**:
- Keep the edit button (pencil icon, calls `onEdit`) — unchanged
- Change the existing "delete" button to always show `<Trash2>` icon and always call `onDelete`
- Add a new button BEFORE the delete button: when `onReturnToQA !== undefined`, render a button with `<Undo2>` icon, `variant="ghost" size="icon"`, `aria-label="Вернуть в QA"`, `onClick={onReturnToQA}`
- Import `Undo2` (already imported) and keep `Trash2`

**Result**: When `onReturnToQA` is provided, there will be three action buttons: edit (pencil), return-to-QA (Undo2), delete (Trash2). The old behavior where the delete button showed Undo2 icon is removed.

#### File: `src/components/current/CurrentTasksRow.tsx`

**Update `CurrentTasksRowProps` interface**:
- Add `onReturnToQA: () => void`

**Update `ActionButtons` usage**:
- Pass `onReturnToQA={onReturnToQA}`
- Remove `returnToQa` prop (it's deleted)

#### File: `src/components/current/CurrentTasksTable.tsx`

**Update `CurrentTasksTableProps` interface**:
- Add `onReturnToQA: (taskId: string) => void`

**Update `CurrentTasksRow` usage** (in the `.map()`):
- Pass `onReturnToQA={() => onReturnToQA(task.id)}`

#### File: `src/app/current/page.tsx`

**Update state**:
- Rename `returningTaskId` state and related handlers to make clear it's for "return to QA" (or keep the name — it's fine either way)
- The existing ConfirmDialog for "Вернуть в QA" stays — keep the confirmation flow

**Update `CurrentTasksTable` usage**:
- The existing `onDelete` prop was being (mis)used as return-to-QA. Separate them:
  - Add a real delete handler (currently there's no actual delete in CurrentPage — tasks can only be returned to QA from here, not deleted). Check: looking at the code, `onDelete={setReturningTaskId}` — the page was using "delete" as a proxy for "return to QA". This is a naming mismatch.
  - The correct fix: rename/re-wire:
    - `onEdit={setEditingTask}` stays the same
    - `onDelete` — this should trigger an actual delete confirm dialog. But looking at the current code, there is NO delete functionality for current tasks in the UI. The page currently uses `onDelete` to trigger the "return to QA" confirm dialog. Per TS: return to QA is the only action here (besides edit). There is no explicit "delete" action for current tasks.
    - Therefore: pass `onReturnToQA={setReturningTaskId}` and also pass a no-op or remove `onDelete` usage entirely. Since `CurrentTasksTable` requires `onDelete` from `CurrentTasksRow` which requires it from `ActionButtons`, we need to decide: should the delete button appear in the Current tab?
    - Decision: **keep delete functionality** in Current tab (it exists today). Pass `onDelete` as a proper delete handler using `deleteTaskAtom`.

**Concrete changes to `current/page.tsx`**:
- Import `deleteTaskAtom` from `@/atoms/tasksAtom`
- Add `const deleteTask = useSetAtom(deleteTaskAtom)`
- Add state: `const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null)`
- Add a second `ConfirmDialog` for delete confirmation
- Pass to `CurrentTasksTable`:
  - `onDelete={setDeletingTaskId}` (actual delete)
  - `onReturnToQA={setReturningTaskId}` (return to QA)
- Add delete confirm handler: `await deleteTask(deletingTaskId)`

## Acceptance Criteria
- [ ] `ActionButtons` has separate `onReturnToQA` and `onDelete` props (no `returnToQa` boolean)
- [ ] When `onReturnToQA` is provided, an Undo2 button is rendered separate from the Trash2 delete button
- [ ] `CurrentTasksRow` accepts and passes `onReturnToQA`
- [ ] `CurrentTasksTable` accepts and passes `onReturnToQA`
- [ ] `current/page.tsx` wires `onReturnToQA` to `returnToQAAtom` (via confirm dialog)
- [ ] `current/page.tsx` wires `onDelete` to `deleteTaskAtom` (via confirm dialog)
- [ ] TypeScript compilation passes

## Notes

- The `CompletedTasksRow` currently uses `ActionButtons` with `returnToQa={true}` and maps the "delete" callback to the return-to-QA action. After this task's changes to `ActionButtons`, `CompletedTasksRow` will have a TypeScript error (removed `returnToQa` prop). Task 5.2 fixes this.
- Be careful: after removing `returnToQa` prop from `ActionButtons`, any existing usage that passed `returnToQa={true}` will produce a TS error. Task 5.2 must be done immediately after to fix the completed tab.
