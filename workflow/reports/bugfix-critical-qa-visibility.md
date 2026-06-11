# Bugfix Report: Critical QA Visibility Issue

## Status
✅ Fix applied and verified

## Problem
Tasks were disappearing from the QA tab after clicking "Взять в работу" (Take into work).

**Root cause:** `qaTasksAtom` was filtering tasks with `taken_into_work_at === null`, which excluded tasks that had been taken into work. This caused them to vanish from the QA view.

## Fix

### Modified files:
- `src/atoms/tasksAtom.ts` — changed filter predicate in `qaTasksAtom`

**Before:**
```ts
export const qaTasksAtom = atom((get) =>
  get(tasksAtom).filter((t) => t.taken_into_work_at === null),
);
```

**After:**
```ts
export const qaTasksAtom = atom((get) =>
  get(tasksAtom).filter((t) => t.completed_at === null),
);
```

## Derived Atoms — Final Logic

| Atom | Filter | Meaning |
|---|---|---|
| `qaTasksAtom` | `completed_at === null` | All non-completed tasks (new + in-work) |
| `currentTasksAtom` | `isTaskActive(t)` | Tasks actively being worked on |
| `completedTasksAtom` | `isTaskCompleted(t)` | Completed tasks |

## Verification
- `pnpm lint` — ✅ No errors
- `pnpm build` — ✅ Compiled successfully (Next.js 16.2.9 Turbopack)
