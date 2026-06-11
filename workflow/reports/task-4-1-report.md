# Task 4.1 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/modals/CreatePeriodModal.tsx` — modal for creating a new period with date range picker, validation, and optimistic update support

## Implementation Notes

- Uses `ModalWrapper` with title "Добавить период" and `size="sm"`
- `DateRangePicker` renders the body; validation error is passed via the `error` prop so it renders inline below the pickers
- Form state (`startDate`, `endDate`, `error`, `loading`) resets on modal close via `useEffect` on `open` prop
- Submit validation:
  - Requires both dates to be set
  - Checks `dayjs(endDate).isBefore(dayjs(startDate))` for invalid range
- After a successful `createPeriodAtom` call, reads `periodsAtom` directly from the Jotai store (`useStore`) to avoid stale closures, then calls `initExpandedPeriodsAtom` so the newly created period (inserted at index 0 by the optimistic update) becomes expanded
- Error handling: catches failures from `createPeriodAtom` and surfaces a user-facing error message without closing the modal
