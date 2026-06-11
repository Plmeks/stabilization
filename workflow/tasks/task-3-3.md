# Task 3.3: PriorityBadge, StatusBadge & PeriodBadge

## Related Use Cases
- UC-3: Take Into Work
- UC-4: Edit Task
- UC-5: Complete Task
- UC-7: View & Lock Stats

## Goal
Three small display-only badge components for priority, status, and period date range.

## Changes

### New Files

#### `src/components/shared/PriorityBadge.tsx`
- Props: `priority: Priority | null`
- Returns `null` if priority is null
- Renders a small `<span>` or shadcn/ui `Badge` with text and color:
  - "Авария" → red background
  - "Нормальный" → blue background
  - "Некритичный" → gray background
- Uses `PRIORITY_COLORS` from `src/types/constants.ts`

#### `src/components/shared/StatusBadge.tsx`
- Props: `status: TaskStatus`
- Renders a `Badge` with color per status:
  - "Бэклог" → gray
  - "В работе" → blue
  - "В тесте" → yellow/amber
  - "Завершена" → green
  - "Блокер" → red
- Uses `STATUS_COLORS` from constants

#### `src/components/shared/PeriodBadge.tsx`
- Props: `period: Period`
- Renders the formatted label "DD.MM - DD.MM.YYYY" using `formatPeriodLabel` from utils
- Styled as a small neutral text label (no background)

## Notes
- All three are purely presentational, no state or side effects
- Used in task rows, table cells, and stats cards
