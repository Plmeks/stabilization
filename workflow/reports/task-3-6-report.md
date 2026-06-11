# Task 3.6 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/shared/ActionButtons.tsx` — compact icon-button group with edit (Pencil) and delete (Trash2) actions

## Notes
- Edit button is conditionally rendered: only shown when `onEdit` prop is provided
- Delete button always renders with `text-destructive hover:text-destructive` styling
- Both buttons use `variant="ghost"` with `size="icon"` and fixed `h-8 w-8` dimensions
- Accessible `aria-label` values: "Редактировать" (edit) and "Удалить" (delete)
- `disabled` prop disables both buttons simultaneously
- No tests per client request
