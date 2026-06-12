# Task 1-1: Install Recharts Dependency

## Description
Install the `recharts` package via pnpm so that chart components can import from it in subsequent tasks.

## Changes Required

### New Files
- none

### Modified Files
- `package.json` — recharts added to dependencies (auto-updated by pnpm)
- `pnpm-lock.yaml` — lockfile updated (auto-updated by pnpm)

## Implementation Details

1. Run: `pnpm add recharts`
2. Verify the install succeeded: `recharts` appears in `dependencies` in `package.json`
3. Run `pnpm build` to confirm no build errors from the new dependency

## Dependencies
- Depends on: none

## Acceptance Criteria
- [ ] `recharts` is listed in `package.json` dependencies
- [ ] `pnpm build` completes without errors
- [ ] No TypeScript errors introduced

## Complexity
Simple
