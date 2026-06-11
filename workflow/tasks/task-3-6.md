# Task 3.6: ActionButtons

## Related Use Cases
- UC-4: Edit Task
- UC-8: Delete Task

## Goal
A compact icon-button group with edit (pencil) and delete (trash) actions.

## Changes

### New Files

#### `src/components/shared/ActionButtons.tsx`
- Props:
  - `onEdit?: () => void` — if omitted, edit button is hidden
  - `onDelete: () => void`
  - `disabled?: boolean`
- Renders two icon buttons side by side:
  - Edit: `Pencil` icon from `lucide-react`, `variant="ghost"` shadcn/ui Button, small size
  - Delete: `Trash2` icon, same style but with `text-destructive hover:text-destructive`
- Accessible: `aria-label="Редактировать"` and `aria-label="Удалить"`

## Notes
- Used in table "Actions" column for Current and Completed tabs
- Also used in QA task list item (delete only, or both)
- The delete action triggers a `ConfirmDialog` in the parent component — `ActionButtons` only calls `onDelete` callback
