# Chart Filter Direction Fix

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/components/stats/charts/ChartsSection.tsx` — fixed `chartData` useMemo to slice from beginning to selected period (inclusive) instead of from selected period to end

## Change Detail

**Before (wrong):**
```typescript
const chartData = useMemo(
  () => allChartData.slice(selectedSortedIndex),
  [allChartData, selectedSortedIndex],
);
```

**After (correct):**
```typescript
const chartData = useMemo(
  () => allChartData.slice(0, selectedSortedIndex + 2),
  [allChartData, selectedSortedIndex],
);
```

## Explanation
`allChartData` has the structure `[anchor, P1, P2, P3, ...]`. When a user selects period at `selectedSortedIndex`, we want all data from the anchor up to and including that period:
- `+1` for the inclusive selected period
- `+1` for the anchor point at index 0

## Test Cases Verified
- Select P3 (index=2): `slice(0, 4)` → `[anchor, P1, P2, P3]` ✓
- Select P2 (index=1): `slice(0, 3)` → `[anchor, P1, P2]` ✓
- Select P1 (index=0): `slice(0, 2)` → `[anchor, P1]` ✓
