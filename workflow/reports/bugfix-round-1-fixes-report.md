# Bugfix Round 1 — Fix Report

## Status
✅ All 3 blocking issues resolved. `pnpm lint` and `pnpm build` pass without errors.

## Changed Files

### Modified files:

- `src/components/modals/AddTaskModal.tsx` — Eliminated `useEffect` setState pattern. Outer component guards with `if (!open) return null`; inner `AddTaskModalContent` holds all state and is naturally re-created on each open.

- `src/components/modals/EditTaskModal.tsx` — Same pattern: outer `EditTaskModal` returns null when closed; inner `EditTaskModalContent` initialises state directly from `task` prop via `useState`. `ModalWrapper` now receives `open={!showCompleteModal}` (outer already handles the `open` guard).

- `src/components/modals/TakeIntoWorkModal.tsx` — Same pattern: outer guard + inner `TakeIntoWorkModalContent`.

- `src/components/modals/CreatePeriodModal.tsx` — Same pattern applied to `CreatePeriodModal` (same ESLint error was present here too, not listed in the review but caught by `pnpm lint`).

- `src/app/stats/page.tsx` — "Добавлено в беклог" (`addedToBacklog`) and "Критических добавлено" (`addedCritical`) now filter by `taken_into_work_at !== null` and use `taken_into_work_at` for the date range check instead of `created_at`.

- `src/lib/supabase/dal.ts` — `returnTaskToQA` update payload extended with `assignee: null, priority: null` so that both fields are cleared when a task is returned to QA queue.

## Verification

| Check | Result |
|---|---|
| `pnpm lint` | ✅ 0 errors, 0 warnings |
| `pnpm build` | ✅ Compiled & all 6 pages generated successfully |
