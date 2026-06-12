# Task 4-1: Integrate ChartsSection into Statistics Page

## Description
Modify `src/app/stats/page.tsx` to import and render `<ChartsSection />` above the period cards. This is the final integration step that makes the charts visible to the user.

## Changes Required

### New Files
- none

### Modified Files
- `src/app/stats/page.tsx` — add import for `ChartsSection` and render it above the period list

## Implementation Details

### Changes to `src/app/stats/page.tsx`

**Add import** (alongside existing imports):
```
import ChartsSection from '@/components/stats/charts/ChartsSection'
```

**Render `<ChartsSection />`** inside the return JSX, placed **above** the period cards list and **below** the "Развернуть все / Свернуть все" button row.

The current return JSX structure is:
```jsx
<div className="p-6 space-y-5">
  {sortedPeriods.length > 0 && (
    <div className="flex justify-end">
      <Button variant="outline" size="sm" onClick={toggleAll}>
        {isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
      </Button>
    </div>
  )}
  {sortedPeriods.map((period) => { ... })}
</div>
```

**After the change**, it should look like:
```jsx
<div className="p-6 space-y-5">
  {sortedPeriods.length > 0 && (
    <div className="flex justify-end">
      <Button variant="outline" size="sm" onClick={toggleAll}>
        {isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
      </Button>
    </div>
  )}
  <ChartsSection />
  {sortedPeriods.map((period) => { ... })}
</div>
```

**Note:** `ChartsSection` already handles the empty-data case by returning `null` when `periods.length === 0`, so no additional conditional rendering is needed here.

**No other changes** to `src/app/stats/page.tsx` are needed — the atoms, sorting logic, and period card rendering remain unchanged.

## Post-implementation Verification

1. Run `pnpm dev` and navigate to the Statistics tab
2. Verify all three charts render above the period cards
3. Run `pnpm build` and confirm it passes with no TypeScript errors
4. Run ReadLints on `src/app/stats/page.tsx` to check for linter issues

## Dependencies
- Depends on: task-3-1 (ChartsSection component)

## Acceptance Criteria
- [ ] `ChartsSection` imported at the top of `src/app/stats/page.tsx`
- [ ] `<ChartsSection />` rendered above the period cards in the JSX
- [ ] Charts are visible on the Statistics tab in the browser
- [ ] Charts do not appear when there are no periods
- [ ] `pnpm build` passes without errors
- [ ] No TypeScript or linter errors in the modified file

## Complexity
Simple
