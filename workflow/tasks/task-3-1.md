# Task 3.1: ModalWrapper & ConfirmDialog

## Related Use Cases
- UC-1: Create Period
- UC-2: Add QA Task
- UC-3: Take Into Work
- UC-4: Edit Task
- UC-5: Complete Task
- UC-8: Delete Task
- UC-9: Delete Period

## Goal
Build two reusable modal components used by all feature modals.

## Changes

### New Files

#### `src/components/shared/ModalWrapper.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
  - `title: string`
  - `children: React.ReactNode`
  - `footer?: React.ReactNode` — custom footer (buttons), if not provided defaults to a single "Закрыть" button
  - `size?: 'sm' | 'md' | 'lg'` — default `'md'`
- Uses shadcn/ui `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `onClose` is called on ESC key and overlay click (Dialog handles this)
- Accessible: focus trap managed by Dialog

#### `src/components/shared/ConfirmDialog.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
  - `onConfirm: () => void`
  - `title: string`
  - `message: string`
  - `confirmLabel?: string` — default "Удалить"
  - `destructive?: boolean` — default `true`; makes confirm button `variant="destructive"`
  - `loading?: boolean` — disables buttons while async op is pending
- Wraps `ModalWrapper` with `size="sm"`
- Footer: Cancel button (`onClose`) + Confirm button (`onConfirm`, destructive variant)

## Notes
- All feature modals will use `ModalWrapper` as their shell
- `ConfirmDialog` is used for delete confirmations (UC-8, UC-9) and any other two-step confirmations
