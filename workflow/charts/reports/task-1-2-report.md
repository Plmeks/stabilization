# Task 1.2 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/lib/chart-utils.ts` — exports `ChartDataPoint` type and `calculateChartData()` function

### Modified files:
- none

## Notes
- `calculateChartData()` is a pure function that returns `[anchorPoint, ...periodPoints]` where anchor is the day before the first period's start date with all-zero numeric values.
- When a `PeriodStatistics` record exists for a period, its fixed values are used directly; otherwise `calculateDynamicMetrics()` is called for live calculation.
- Build passes with no TypeScript errors (`pnpm build` ✅).
- No linter errors (`ReadLints` ✅).
