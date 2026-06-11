# Task 3.1 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/shared/ModalWrapper.tsx` — reusable modal shell using shadcn/ui Dialog; supports `open`, `onClose`, `title`, `children`, optional `footer`, and `size` ('sm' | 'md' | 'lg', default 'md')
- `src/components/shared/ConfirmDialog.tsx` — two-button confirmation dialog wrapping ModalWrapper; supports `open`, `onClose`, `onConfirm`, `title`, `message`, optional `confirmLabel` (default "Удалить"), `destructive` (default true), and `loading`

## Notes
- `ModalWrapper` maps `size` prop to Tailwind max-width overrides on `DialogContent` (`sm:max-w-sm` / `sm:max-w-lg` / `sm:max-w-2xl`), overriding the shadcn default `sm:max-w-sm`
- Close on ESC and overlay click is handled natively by `Dialog` via the `onOpenChange` callback
- `ConfirmDialog` footer renders Cancel first (left), Confirm second (right) matching `DialogFooter`'s `sm:flex-row sm:justify-end` layout
- No tests per client request
