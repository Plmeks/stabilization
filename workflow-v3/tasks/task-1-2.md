# Task 1.2: DAL Updates

## Related Use Cases
- UC-2: Lock Period Metrics with New Fields
- UC-3: Edit Locked Metrics
- UC-4: Add/Edit Comment for Locked Period Statistics

## Task Goal
Update the Data Access Layer (`dal.ts`) to accept and return the expanded `PeriodStatistics` type. Add a dedicated `updatePeriodStatisticsComment` function for the debounced comment save feature.

## Description of Changes

### Changes to Existing Files

#### File: `src/lib/supabase/dal.ts`

**1. Update `createPeriodStatistics` signature**

The `metrics` parameter currently uses `Omit<PeriodStatistics, 'id' | 'period_id' | 'locked_at' | 'created_at'>`. After task 1.1, `PeriodStatistics` has new fields, so this `Omit` type automatically expands to require all new fields. **No code change is needed** — the `Omit` type is dynamic. Verify that the function still compiles without errors.

**2. Update `updatePeriodStatistics` signature**

Same as above — the `Omit`-based type automatically expands. **Verify compilation only.**

**3. Add new function: `updatePeriodStatisticsComment`**

Add after `updatePeriodStatistics`:

```
export async function updatePeriodStatisticsComment(
  id: string,
  comment: string | null,
): Promise<void>
```

- Sends an UPDATE to `period_statistics` setting `{ comment }` where `id = id`
- Does NOT return the updated record (void return — the caller manages optimistic state)
- Throws on Supabase error

Implementation logic:
- Call `supabase.from('period_statistics').update({ comment }).eq('id', id)`
- Check `error` and throw if present

## Acceptance Criteria
- [ ] `createPeriodStatistics` compiles without errors after the `PeriodStatistics` type expansion
- [ ] `updatePeriodStatistics` compiles without errors after the `PeriodStatistics` type expansion
- [ ] `updatePeriodStatisticsComment(id, comment)` function exists and is exported
- [ ] `updatePeriodStatisticsComment` updates only the `comment` field (does not touch other metrics)
- [ ] The function handles `null` comment (clears the comment field in DB)

## Notes
- The `Omit` pattern in existing functions means the signatures don't need literal code changes — just verify they still compile after task 1.1.
- `updatePeriodStatisticsComment` is intentionally separate from `updatePeriodStatistics` to keep comment-only saves lightweight (no need to send all 15 metric fields).
