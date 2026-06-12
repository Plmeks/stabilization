# Task 3-1: Set Up Vitest and Write Unit Tests for `stats-utils.ts` and `chart-utils.ts`

## Objective

Add automated unit test coverage for the fixed-data-aware calculation logic introduced in Tasks 1-1 and 1-2. No test runner currently exists in the project — Vitest must be installed and configured first.

## Use Cases

This task covers all use cases at the test level:
- **UC-1**: Anchor point uses fixed data when first period has no tasks
- **UC-2**: Cumulative chart values respect fixed data from prior periods
- **UC-3**: Stats/dynamic metrics include fixed base from prior period
- **UC-4**: Mixed fixed/unfixed chain works end-to-end
- **UC-5**: All periods fixed — each uses own values
- **UC-6**: No fixed stats — regression (behavior unchanged)

## Description of Changes

### New Files

- `vitest.config.ts` — Vitest configuration
- `src/lib/stats-utils.test.ts` — unit tests for `calculateDynamicMetrics()`
- `src/lib/chart-utils.test.ts` — unit tests for `calculateChartData()`

### Changes to Existing Files

#### `package.json`
Add to `devDependencies` (run `pnpm add -D vitest @vitest/coverage-v8`):
- `"vitest": "^2.x"` (latest stable)
- `"@vitest/coverage-v8": "^2.x"`

Add to `scripts`:
```
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

### `vitest.config.ts`

Create a minimal Vitest config:
- `test.environment = 'node'` (no DOM needed — pure utility functions)
- `test.globals = true`
- Resolve `@/` alias to `src/` (mirrors the Next.js alias)

### `src/lib/stats-utils.test.ts`

Test `calculateDynamicMetrics()`. Use factory helpers to build minimal `Period`, `Task`, and `PeriodStatistics` objects.

**Test group: "no fixed stats (regression)"**
- TC-UNIT-01: Single period, 3 tasks all uncompleted → `total=3, completed=0, uncompleted=3`
- TC-UNIT-02: Two periods, P1 has 5 tasks (3 completed), P2 has 2 tasks (1 completed) → for P2: `total=7, completed=4, uncompleted=3`
- TC-UNIT-03: `periodStatistics = undefined` and `periodStatistics = []` produce identical results

**Test group: "with fixed stats in prior period"**
- TC-UNIT-04 (UC-2 canonical): P1 fixed (`total=50, completed=30, uncrit=15, crit=5`); P2 unfixed, 2 new tasks (both non-critical), 3 tasks resolved (all non-critical, active in P2). `calculateDynamicMetrics(P2, ...)` → `total=52, completed=33, uncompleted=19, uncompleted_non_critical=15+2-3=14, uncompleted_critical=5`
- TC-UNIT-05: P1 fixed (`total=10, completed=5, uncrit=3, crit=2`); P2 unfixed, 1 new critical task, 2 critical resolved → `uncompleted_critical = 2 + 1 - 2 = 1` (can decrease)
- TC-UNIT-06 (UC-4 chain): P1(fixed, total=50, completed=30), P2(unfixed, 2 added 1 resolved), P3(fixed, total=70, completed=45), P4(unfixed, 3 added 1 resolved):
  - `calculateDynamicMetrics(P4, ...)` → `total=73, completed=46`

**Test group: "all periods fixed" (UC-5)**
- TC-UNIT-07: P1 fixed, P2 fixed. `calculateDynamicMetrics(P2, ...)` → cumulative values = P2's own fixed stats (P2 resets on top of P1)

**Test group: "period-specific flow metrics unchanged"**
- TC-UNIT-08: `added_to_backlog`, `resolved_total`, `in_progress`, etc. are NOT affected by fixed stats from prior periods — they only count tasks for the current period

### `src/lib/chart-utils.test.ts`

Test `calculateChartData()`.

**Test group: "anchor point"**
- TC-UNIT-10 (UC-1): First period has fixed stats (`added_to_backlog=50, added_critical=5, added_non_critical=45`) and zero tasks → `anchorPoint.total_problems_cumulative=50, uncompleted_critical=5, uncompleted_non_critical=45`
- TC-UNIT-11: First period has no fixed stats, 3 tasks (1 critical) → `anchorPoint.total_problems_cumulative=3, uncompleted_critical=1` (regression)
- TC-UNIT-12: First period has both fixed stats and tasks → fixed stats win for anchor

**Test group: "data points with mixed fixed/unfixed"**
- TC-UNIT-13 (UC-2): P1 fixed (total=50, completed=30), P2 unfixed (2 tasks added, 0 resolved) → P2 data point: `total=52, completed=30`
- TC-UNIT-14 (UC-6 regression): No fixed stats, three periods with tasks → data points match current behavior

**Test group: "compute-all semantics" (UC-4)**
- TC-UNIT-15: Call `calculateChartData([P1, P2, P3, P4], tasks, stats)` and verify P3/P4 data point values — then call again with `[P3, P4]` (no fixed stats, no tasks outside these) — if P1 had fixed stats, the second call MUST differ from the first, confirming that filtering periods in callers breaks cumulative accuracy (this test documents the bug that Task 2-1 fixes by always passing the full list)

## Implementation Details

### Step 1: Install Vitest
```
pnpm add -D vitest @vitest/coverage-v8
```

### Step 2: Create `vitest.config.ts`
Minimal config with Node environment and `@/` alias resolving to `./src`.

### Step 3: Write test factory helpers

In each test file, define local factory functions (not shared modules):
- `makePeriod(id, startDate, endDate): Period` — creates a Period with ISO date strings
- `makeTask(id, creationPeriodId, activePeriodId, status, priority): Task` — creates a Task
- `makeStats(periodId, overrides): PeriodStatistics` — creates a PeriodStatistics object with sensible defaults

### Step 4: Write tests following the matrix above

Use `describe` blocks per test group. Each test should be self-contained — create its own periods, tasks, and stats inline using factory helpers.

## Acceptance Criteria

- [ ] `pnpm test` exits with code 0 and all tests pass
- [ ] All test groups from the matrix above are present and passing
- [ ] No test imports from UI components or Next.js-specific modules
- [ ] TypeScript compiles with no errors

## Test Strategy

These ARE the tests — this task exists solely to write them.

## Dependencies

- **Depends on:** Task 1-1 (new `calculateDynamicMetrics()` signature), Task 1-2 (updated `calculateChartData()`)
- **Blocks:** Nothing

## Notes

- Use `dayjs` in test factories for date construction (already in `package.json`).
- The `@/` alias in `vitest.config.ts` must match `tsconfig.json`'s `paths` configuration so imports resolve correctly.
- Keep all test factories local to each test file — do not create a shared `test-utils.ts` module unless tests grow significantly beyond this scope.
- TC-UNIT-15 is intentionally a "negative" test that demonstrates the bug — it helps future developers understand why `ChartsSection` must pass the full period list.
