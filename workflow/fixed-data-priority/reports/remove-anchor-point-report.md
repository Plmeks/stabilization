# Remove Anchor Point Task Result

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/lib/chart-utils.ts` — Removed all anchor point calculation logic (both fixed-stats and dynamic branches). Function now returns `periodPoints` directly instead of `[anchorPoint, ...periodPoints]`.
- `src/components/stats/charts/ChartsSection.tsx` — Updated `chartData` slice offset from `+2` to `+1` (no anchor to account for). Changed `backlogData` from `chartData.slice(1)` to `chartData` (no anchor element to skip).

## Notes
- The anchor point was previously calculated as "day before first period" using reverse formulas on fixed stats or task counts. All that logic has been removed.
- Each chart point now represents the end date of its period, with `label` = `DD.MM` of `end_date` and `periodLabel` = `DD.MM-DD.MM.YY` range.
- Filter behavior matches spec: selecting period at sorted index N produces `slice(0, N+1)` = N+1 points (one per period up to and including selected).
- `backlogData` now equals `chartData` in full — no anchor element to strip.
