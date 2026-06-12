# Task 2.1 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/lib/stats-utils.ts` — exports `DynamicMetrics` type and `calculateDynamicMetrics(period, allPeriods, allTasks)` function with corrected `added_to_backlog` logic and dayjs-based cumulative calculations

### Modified files:
- `src/atoms/statsAtom.ts` — added imports for `periodsAtom` and `calculateDynamicMetrics`; updated `MetricsPayload` to omit `comment`; refactored `lockPeriodMetricsAtom` to use `calculateDynamicMetrics`; updated `updatePeriodStatisticsAtom` to preserve existing comment when updating numeric metrics; added new `updatePeriodCommentAtom` (with `statisticsId` parameter)

## Notes

- **Bug fix:** `added_to_backlog` now uses `periodTasks.length` (all tasks for the period, regardless of status). Previously it filtered by `status !== null`, which excluded QA/backlog tasks.
- **`wip_total`:** Correctly equals `in_progress + in_testing` (excludes `in_block`).
- **Cumulative metrics:** Use `dayjs` with `isSameOrBefore` plugin to compare `start_date` values properly instead of string arithmetic.
- **`updatePeriodStatisticsAtom`:** When updating numeric metrics (edit locked snapshot), the existing `comment` value is preserved by reading it from the atom state before the DAL call.
- **Backwards compatibility:** The existing `updatePeriodStatisticsCommentAtom` (with `{ id, comment }` signature) is kept alongside the new `updatePeriodCommentAtom` (with `{ statisticsId, comment }` signature) to avoid breaking existing consumers.
- TypeScript compilation: `pnpm tsc --noEmit` exits with code 0, no errors.
