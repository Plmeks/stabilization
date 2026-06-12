# Anchor Point Fix Report

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/lib/chart-utils.ts` — Fixed anchor point calculation in the `if (firstFixedStats)` block

## Problem
The anchor point for the CFD chart was incorrectly using **added** values (tasks added _during_ the period) instead of computing the state **before** the period started.

Old (wrong):
```typescript
uncompleted_critical: firstFixedStats.added_critical,        // ❌
uncompleted_non_critical: firstFixedStats.added_non_critical, // ❌
total_problems_cumulative: firstFixedStats.added_to_backlog,  // ❌
```

## Fix Applied
Anchor point now correctly derives the state at the **start** of the first period using the reverse formula:

```
start = end - added + resolved
```

New calculation:
- `uncompleted_critical` = `uncompleted_critical_end` - `added_critical` + `resolved_critical`
- `uncompleted_non_critical` = `uncompleted_non_critical_end` - `added_non_critical` + `resolved_non_critical`
- `total_problems_cumulative` = `total_problems_cumulative_end` - `added_to_backlog`
- `completed_cumulative` = `completed_cumulative_end` - `resolved_total`

## Test Case Verification

Given first period fixed stats:
| Field | Value |
|---|---|
| `uncompleted_critical` | 47 |
| `added_critical` | 10 |
| `resolved_critical` | 5 |
| `uncompleted_non_critical` | 51 |
| `added_non_critical` | 8 |
| `resolved_non_critical` | 2 |
| `total_problems_cumulative` | 107 |
| `added_to_backlog` | 18 |
| `completed_cumulative` | 9 |
| `resolved_total` | 7 |

Expected anchor point (verified ✅):
| Field | Calculation | Result |
|---|---|---|
| `uncompleted_critical` | 47 - 10 + 5 | **42** |
| `uncompleted_non_critical` | 51 - 8 + 2 | **45** |
| `total_problems_cumulative` | 107 - 18 | **89** |
| `completed_cumulative` | 9 - 7 | **2** |

## Notes
The fix only affects the `if (firstFixedStats)` branch (fixed/historical data path). The dynamic/task-based fallback branch is unaffected.
