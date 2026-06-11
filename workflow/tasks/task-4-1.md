# Task 4.1: CreatePeriodModal

## Related Use Cases
- UC-1: Create Period

## Goal
Modal for creating a new period with start/end date pickers and validation.

## Changes

### New Files

#### `src/components/modals/CreatePeriodModal.tsx`
- Client component
- Props:
  - `open: boolean`
  - `onClose: () => void`
- Internal state: `startDate: string | null`, `endDate: string | null`, `error: string | null`, `loading: boolean`
- Uses `ModalWrapper` with title "Добавить период"
- Body: `DateRangePicker` component
- Footer: "Отмена" button (`onClose`) + "Создать" button (primary, triggers submit)
- On submit:
  1. Validate: both dates required, `endDate >= startDate` (compare with dayjs); set `error` if invalid
  2. Set `loading = true`
  3. Call `createPeriodAtom` write atom with `{ start_date, end_date }`
  4. Call `initExpandedPeriodsAtom` with updated periods to keep the latest expanded
  5. Call `onClose`
- Shows error message below the date pickers

## Notes
- On success, the period appears immediately due to optimistic update in `createPeriodAtom`
- Reset form state when modal closes (`useEffect` on `open` prop)
