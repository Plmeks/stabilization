# Task 2.3: Update Periods Jotai Atom (WIP Transfer + Pre-Deletion Reset)

## Related Use Cases
- UC-07: Create a New Period (with WIP task transfer)
- UC-12: Delete a Period (with pre-deletion active_period reset)

## Task Goal
Update `src/atoms/periodsAtom.ts` to:
1. After creating a period that becomes the latest, batch-transfer all WIP tasks' `active_period_id` to the new period
2. Before deleting a period, reset `active_period_id` for cross-period tasks and remove cascade-deleted tasks from the Jotai state

## Description of Changes

### Changed Files

#### File: `src/atoms/periodsAtom.ts`

---

**New imports**

Add DAL imports:
```ts
import { transferWipTasks, resetActivePeriodForDeletion } from '@/lib/supabase/dal';
```

Add tasks atom import:
```ts
import { tasksAtom } from '@/atoms/tasksAtom';
```

---

**Atom `createPeriodAtom` — add WIP transfer after period creation**

After the line that replaces the temp period with the real period and re-sorts, add the WIP transfer logic. This must go **inside the try block**, after `realPeriod` is obtained and the periods atom is updated.

Identify whether the new period is the latest by checking if it is `periodsAtom[0]` after the sort:
```ts
const updatedPeriods = get(periodsAtom);
const isLatest = updatedPeriods.length > 0 && updatedPeriods[0].id === realPeriod.id;
```

If it is the latest, call `transferWipTasks` and update `tasksAtom`:
```ts
if (isLatest) {
  try {
    const updatedTasks = await transferWipTasks(realPeriod.id);
    if (updatedTasks.length > 0) {
      const updatedMap = new Map(updatedTasks.map((t) => [t.id, t]));
      set(tasksAtom, get(tasksAtom).map((t) => updatedMap.get(t.id) ?? t));
    }
  } catch (transferError) {
    console.error('WIP transfer failed after period creation:', transferError);
    // Period was created successfully. Transfer failure is non-fatal per TS §4.2 assumption 9.
    // The error is logged; the user sees the period but WIP tasks are not yet reassigned.
  }
}
```

The WIP transfer error does NOT roll back the period creation (per TS decision D2: sequential app-level calls, accepted trade-off).

The optimistic update and the rollback-on-error logic for period creation itself remain unchanged.

---

**Atom `deletePeriodAtom` — add pre-deletion reset**

The deletion must follow this sequence:
1. Optimistic: remove period from `periodsAtom` (keep existing)
2. Call `resetActivePeriodForDeletion(id)` to reset affected tasks in DB
3. Update `tasksAtom`: apply reset results AND remove tasks whose `creation_period_id = id` (they will be cascade-deleted in DB)
4. Call `deletePeriod(id)` to delete the period in DB
5. On any error: roll back both `periodsAtom` and `tasksAtom`

Replace the current body of the `deletePeriodAtom` write function with:

```ts
async (get, set, id: string) => {
  const previousPeriods = get(periodsAtom);
  const previousTasks = get(tasksAtom);

  // Optimistic: remove period from UI immediately
  set(periodsAtom, previousPeriods.filter((p) => p.id !== id));

  try {
    // Step 1: reset active_period_id for cross-period tasks BEFORE deletion
    const resetTasks = await resetActivePeriodForDeletion(id);

    // Step 2: update tasksAtom — apply resets and remove cascade-deleted tasks
    const resetMap = new Map(resetTasks.map((t) => [t.id, t]));
    set(
      tasksAtom,
      previousTasks
        .filter((t) => t.creation_period_id !== id)  // remove tasks that will be cascade-deleted
        .map((t) => resetMap.get(t.id) ?? t),         // apply active_period_id resets
    );

    // Step 3: delete the period (cascade-deletes tasks with creation_period_id = id in DB)
    await deletePeriod(id);
  } catch (error) {
    // Rollback both atoms
    set(periodsAtom, previousPeriods);
    set(tasksAtom, previousTasks);
    throw error;
  }
},
```

---

**Atoms `fetchPeriodsAtom`:** No changes.

**Derived atom `latestPeriodAtom` (optional, not required):** If other parts of the codebase frequently need the latest period, a derived atom could be added, but it is not required by the TS. The `takeIntoWorkAtom` and `returnTaskToWorkAtom` in `tasksAtom.ts` already read `periodsAtom[0]` directly.

## Acceptance Criteria
- [ ] `createPeriodAtom` calls `transferWipTasks` when the new period is the latest
- [ ] `tasksAtom` is updated with transferred WIP tasks after successful `transferWipTasks`
- [ ] Transfer failure is caught, logged, and does NOT roll back the period creation
- [ ] `deletePeriodAtom` calls `resetActivePeriodForDeletion` before calling `deletePeriod`
- [ ] After deletion, `tasksAtom` has tasks with `creation_period_id = id` removed
- [ ] After deletion, tasks whose `active_period_id` was reset are updated in `tasksAtom`
- [ ] Full rollback (both atoms) on any error during deletion sequence
- [ ] No `period_id` references in the file

## Notes
- **Circular module import resolution**: `tasksAtom.ts` imports `periodsAtom` (added in task-2-2), and `periodsAtom.ts` now needs to import `tasksAtom`. This creates a circular module-level dependency that will cause a Next.js build error.

  **Chosen approach: dynamic `import()` inside write functions.** In `periodsAtom.ts`, do NOT add a top-level `import { tasksAtom } from './tasksAtom'`. Instead, use a dynamic import inside each async write function that needs to access `tasksAtom`:

  ```ts
  // Inside createPeriodAtom write function, where tasksAtom is needed:
  const { tasksAtom } = await import('@/atoms/tasksAtom');
  set(tasksAtom, ...);
  get(tasksAtom);
  ```

  This approach:
  - Breaks the module-level circular dependency (the import only runs at call time, not at module load time)
  - Requires no file restructuring or new files
  - Works correctly because both write functions are already `async`
  - Apply the same pattern in the `deletePeriodAtom` write function

  The top-level `import { transferWipTasks, resetActivePeriodForDeletion } from '@/lib/supabase/dal'` is safe and can remain a top-level import.
