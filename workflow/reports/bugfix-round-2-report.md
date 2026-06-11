# Bugfix Round 2 Report

## Status
✅ All fixes applied, lint clean, build successful

## Changes Made

### Modified files

- `src/components/modals/TakeIntoWorkModal.tsx`
  - Priority state now initialised from `task.priority` (`task.priority ?? ''`) instead of empty string.
  - Means: if the task in QA has priority `'Авария'`, the dropdown is pre-selected with that value when the modal opens; user can still change it.

- `src/components/qa/QATaskListItem.tsx`
  - `<PriorityBadge>` is now rendered **only** when `task.priority === 'Авария'`.
  - Tasks without a priority or with a non-critical priority no longer show a badge.

## Verified (no changes needed)

- `src/app/stats/page.tsx` — metric "Добавлено в беклог" correctly filters by `t.taken_into_work_at !== null` (confirmed, no fix required).
- No "Бэклог at creation" logic found in `AddTaskModal.tsx` — new tasks are created without a status (`status = null`). The only occurrence of `'Бэклог'` default in `TakeIntoWorkModal` is the **status selector** default for the "take into work" action (unrelated to task creation in QA).

## Checks

| Check | Result |
|-------|--------|
| `pnpm lint` | ✅ PASS (no errors) |
| `pnpm build` | ✅ PASS (all 8 pages generated) |
