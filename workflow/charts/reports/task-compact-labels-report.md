# Task: Add Year Suffix and Improve Backlog Chart Tooltips

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/lib/chart-utils.ts` — `periodLabel` now appends `.YY` year suffix (e.g. `01.06-07.06.26`)
- `src/components/stats/charts/BacklogChart.tsx` — Added `formatter` prop to `<Tooltip>` to display Russian labels (`Критические` / `Некритичные`)

## Notes
- Recharts `formatter` callback parameters use generic `ValueType | undefined` / `NameType | undefined` types — explicit type annotations were removed and `String(name)` is used for key comparison to satisfy TypeScript.
- Both `periodLabel` occurrences in `chart-utils.ts` (fixed stats path and dynamic stats path) were updated.
- Build passes with `exit code: 0` — no TypeScript errors.

## Test Results
- `pnpm build` ✅ passes (static prerender of all 7 routes completed successfully)

## Expected Visual Behavior
- X-axis labels: `01.06-07.06.26` format
- Tooltip on hover over a critical backlog point: `Критические: N`
- Tooltip on hover over a non-critical backlog point: `Некритичные: N`
