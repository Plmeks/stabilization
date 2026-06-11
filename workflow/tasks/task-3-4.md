# Task 3.4: DateRangePicker & PeriodSelector

## Related Use Cases
- UC-1: Create Period
- UC-2: Add QA Task
- UC-5: Complete Task

## Goal
Two reusable form components for date range input and period dropdown selection.

## Changes

### New Files

#### `src/components/shared/DateRangePicker.tsx`
- Client component
- Props:
  - `startDate: string | null` — ISO "YYYY-MM-DD"
  - `endDate: string | null`
  - `onStartDateChange: (date: string) => void`
  - `onEndDateChange: (date: string) => void`
  - `error?: string` — validation error message
- Renders two `Popover` + `Calendar` (shadcn/ui) fields side by side:
  - "Дата начала" and "Дата конца"
  - Display value formatted with dayjs as "DD.MM.YYYY"
  - If `error` is provided, show error text below in red
- Validates client-side: end date must be >= start date (parent passes the error)

#### `src/components/shared/PeriodSelector.tsx`
- Client component
- Props:
  - `periods: Period[]`
  - `value: string | null` — selected period id
  - `onChange: (periodId: string) => void`
  - `placeholder?: string` — default "Выберите период"
  - `defaultToLatest?: boolean` — if true, auto-selects the first (latest) period on mount
- Uses shadcn/ui `Select` component
- Each option shows the period label from `formatPeriodLabel`
- Options sorted newest first (matches `periodsAtom` order)

## Notes
- `DateRangePicker` uses dayjs for display formatting only; stores as ISO date strings
- `PeriodSelector` is used in `AddTaskModal` (UC-2), `CompleteTaskModal` (UC-5), and `TakeIntoWorkModal` (UC-3 — period pre-selected/read-only context)
