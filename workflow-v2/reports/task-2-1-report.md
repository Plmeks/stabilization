# Task 2.1 Result

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/lib/utils.ts` — Updated `isTaskActive` to use status-based check (`'В работе' || 'В тесте' || 'Блокер'`) instead of timestamp-based check
- `src/lib/supabase/dal.ts` — Simplified `takeIntoWork(id)` signature (removed `input` param); now sets `status: 'В работе'` and `taken_into_work_at` directly
- `src/atoms/tasksAtom.ts` — Multiple changes (see below)
- `src/components/stats/LockMetricsButton.tsx` — Removed deleted `lockMetricsAtom` import; replaced with local no-op stub to maintain TS compilability

### Changes in `src/atoms/tasksAtom.ts`:
1. **`takeIntoWorkAtom`**: Signature simplified to `id: string`; optimistic update now sets `status: 'В работе'`, `taken_into_work_at`, and `priority: t.priority ?? 'Нормальный'`; DAL call is `await takeIntoWork(id)` (no second arg)
2. **`returnToQAAtom`**: Optimistic patch now includes `assignee: null` (was missing); `priority` is NOT touched
3. **`qaTasksAtom`**: Now returns full `get(tasksAtom)` array with no filtering
4. **`lockMetricsAtom`**: Deleted entirely

## Notes

- `TakeIntoWorkModal` already called `takeIntoWork(task.id)` with correct new signature — no changes needed there
- `dal.ts` was updated even though not in the original affected files list — required to avoid TypeScript error from the removed `input` parameter
- `LockMetricsButton.tsx` was fixed to remove the import of deleted `lockMetricsAtom`; component now uses a local no-op until the stats feature is re-implemented
- `currentTasksAtom` expression is unchanged — it relies on the updated `isTaskActive` from utils.ts
- TypeScript compilation: ✅ 0 errors
