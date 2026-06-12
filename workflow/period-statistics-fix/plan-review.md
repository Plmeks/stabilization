# Development Plan Review Result

## Overall Assessment

⚠️ Revisions required — the plan is structurally sound and executable, but a few non-critical inconsistencies between tasks and the TS should be clarified before development begins.

---

## Formal Checks

### Use Case Coverage

- Total use cases in TS: **13** (UC-01 through UC-13)
- Covered by tasks: **13**
- Not covered: **0**

All use cases appear in the plan's **Use Case Coverage** table with at least one linked task:

| Use Case | Covered By Tasks |
|----------|------------------|
| UC-01 | 1-1, 1-2, 1-3, 2-2, 3-3 |
| UC-02 | 1-1, 1-2, 1-3, 2-2 |
| UC-03 | 1-1, 1-2, 1-3, 2-2, 3-3 |
| UC-04 | 1-1, 1-2, 1-3, 2-2 |
| UC-05 | 1-1, 1-2, 1-3, 2-2, 3-3 |
| UC-06 | 1-1, 1-2, 1-3, 2-2 |
| UC-07 | 1-1, 1-3, 2-3 |
| UC-08 | 1-1, 1-2, 2-1 |
| UC-09 | 1-2, 2-2, 3-1 |
| UC-10 | 1-2, 2-2, 3-2 |
| UC-11 | 1-2, 3-3 |
| UC-12 | 1-3, 2-2, 2-3, 3-1 |
| UC-13 | 1-2, 2-2, 3-4 |

Each task in the plan also lists its related use cases in the **Task Execution Sequence** section.

---

### Task Description Presence

- Total tasks in plan: **10**
- Descriptions present: **10**
- Descriptions missing: **0**

| Task | Description File | Status |
|------|------------------|--------|
| 1-1 | `tasks/task-1-1.md` | ✅ Present, non-empty |
| 1-2 | `tasks/task-1-2.md` | ✅ Present, non-empty |
| 1-3 | `tasks/task-1-3.md` | ✅ Present, non-empty |
| 2-1 | `tasks/task-2-1.md` | ✅ Present, non-empty |
| 2-2 | `tasks/task-2-2.md` | ✅ Present, non-empty |
| 2-3 | `tasks/task-2-3.md` | ✅ Present, non-empty |
| 3-1 | `tasks/task-3-1.md` | ✅ Present, non-empty |
| 3-2 | `tasks/task-3-2.md` | ✅ Present, non-empty |
| 3-3 | `tasks/task-3-3.md` | ✅ Present, non-empty |
| 3-4 | `tasks/task-3-4.md` | ✅ Present, non-empty |

File names match those referenced in `plan.md`.

---

### Plan Structure

| Element | Status |
|---------|--------|
| Phases (Foundation → Core Logic → UI) | ✅ Present |
| Task execution sequence section | ✅ Present |
| Machine-readable dependencies per task | ✅ Present (`Dependencies: task-X-Y`) |
| Parallelizable flags per task | ✅ Present |
| Use case coverage table | ✅ Present |
| Description file references per task | ✅ Present |
| File change map | ✅ Present |

---

### Task Description Structure

- Tasks with complete structure (Related Use Cases + Description of Changes + Acceptance Criteria): **10/10**

| Section | Present in All Tasks |
|---------|---------------------|
| Related Use Cases | ✅ 10/10 |
| Description of Changes | ✅ 10/10 |
| Acceptance Criteria | ✅ 10/10 |
| Test Cases | ❌ 0/10 (section absent in all tasks) |

All tasks additionally include a **Task Goal** section, which supplements but does not replace the required sections.

---

## Content Checks

### File Path Consistency

All **15 file paths** referenced across tasks and the plan's File Change Map were verified to exist in the project:

| File | Referenced By | Exists |
|------|---------------|--------|
| `supabase/migrations/001_create_tables.sql` | 1-1 | ✅ |
| `src/types/index.ts` | 1-2 | ✅ |
| `src/lib/supabase/client.ts` | 1-2 | ✅ |
| `src/lib/supabase/dal.ts` | 1-3 | ✅ |
| `src/lib/stats-utils.ts` | 2-1 | ✅ |
| `src/atoms/tasksAtom.ts` | 2-2 | ✅ |
| `src/atoms/periodsAtom.ts` | 2-3 | ✅ |
| `src/app/qa/page.tsx` | 3-1 | ✅ |
| `src/app/completed/page.tsx` | 3-2 | ✅ |
| `src/components/completed/CompletedTasksTable.tsx` | 3-2 | ✅ |
| `src/components/modals/AddTaskModal.tsx` | 3-3 | ✅ |
| `src/components/modals/EditTaskModal.tsx` | 3-3 | ✅ |
| `src/components/modals/CompleteTaskModal.tsx` | 3-3 | ✅ |
| `src/components/current/CurrentTasksTable.tsx` | 3-4 | ✅ |
| `src/components/current/CurrentTasksRow.tsx` | 3-4 | ✅ |

No task references non-existent paths. File naming is consistent across tasks (no alternate spellings for the same file).

---

### Class/Method Consistency

Cross-task signatures and type changes are **internally consistent** and align with the TS:

| Symbol | Defined In | Consumed In | Consistent |
|--------|-----------|-------------|------------|
| `Task.creation_period_id` / `Task.active_period_id` | 1-2 | 1-3, 2-1, 2-2, 3-1, 3-2, 3-4 | ✅ |
| `CreateTaskInput.creation_period_id` | 1-2 | 1-3 (`createTask`), 2-2 (`createTaskAtom`), 3-3 (`AddTaskModal`) | ✅ |
| `CompletionInput.active_period_id` | 1-2 | 1-3 (`completeTask`), 2-2 (`completeTaskAtom`), 3-3 (`CompleteTaskModal`) | ✅ |
| `takeIntoWork(id, latestPeriodId)` | 1-3 | 2-2 (`takeIntoWorkAtom`) | ✅ |
| `returnTaskToWork(id, input, latestPeriodId)` | 1-3 | 2-2 (`returnTaskToWorkAtom`) | ✅ |
| `returnTaskToQA` (two-step reset) | 1-3 | 2-2 (`returnToQAAtom` optimistic) | ✅ |
| `transferWipTasks(newPeriodId)` | 1-3 | 2-3 (`createPeriodAtom`) | ✅ |
| `resetActivePeriodForDeletion(periodId)` | 1-3 | 2-3 (`deletePeriodAtom`) | ✅ |
| `tasksByCreationPeriodAtom` (renamed from `tasksByPeriodAtom`) | 2-2 | 3-1 | ✅ |
| `tasksByActivePeriodAtom` (new) | 2-2 | 3-1 | ✅ |
| `calculateDynamicMetrics` dual-field filtering | 2-1 | UC-08 | ✅ |

**Minor inconsistency (non-critical):** Task 1-3 **Task Goal** states three new DAL functions including "affected-task counting," but the **Description of Changes** only documents `transferWipTasks` and `resetActivePeriodForDeletion`. Affected-task counting is instead handled in the UI layer (task 3-1 via `tasksByActivePeriodAtom`). Functionality is covered; the task-1-3 goal text should be corrected.

---

### Task Order and Dependencies

The plan follows a correct **top-down** sequence:

1. **Phase 1** — Schema (1-1) and types (1-2) in parallel, then DAL (1-3 depends on 1-2)
2. **Phase 2** — Statistics (2-1, depends on 1-2), atoms (2-2 depends on 1-2 + 1-3), period atom (2-3 depends on 1-3 + 2-2)
3. **Phase 3** — UI tasks depend on foundation atoms/types

Dependency graph has **no circular task dependencies**. All declared dependencies point to earlier tasks:

```
1-1 ─┐
1-2 ─┼─→ 1-3 ─→ 2-2 ─→ 2-3 ─→ 3-1
     └─→ 2-1        ├─→ 3-2
                    ├─→ 3-3
                    └─→ 3-4
```

Task 2-1 correctly depends only on 1-2 (types) and not on 1-3, since `stats-utils.ts` needs type changes but not DAL changes.

---

### Conflict Detection

**No conflicting modifications detected.**

| Check | Result |
|-------|--------|
| Same file modified by multiple tasks | Only non-overlapping phase-3 tasks share no files |
| Conflicting method changes | None — each DAL/atom function has a single owner task |
| Parallel tasks sharing files | None — plan's parallelizable flags match the File Change Map |
| Atom rename (`tasksByPeriodAtom` → `tasksByCreationPeriodAtom`) | Owned solely by task 2-2; consumers updated in task 3-1 |

Phase 3 tasks (3-1, 3-2, 3-3, 3-4) correctly marked as parallelizable with disjoint file sets.

---

### Architecture Alignment

No separate architecture document was provided in `workflow/period-statistics-fix/`. Reviewed against the **technical specification** instead:

| TS Decision / Requirement | Plan Coverage | Status |
|---------------------------|---------------|--------|
| D1: No FK on `active_period_id` | Task 1-1 | ✅ |
| D2: Sequential app-level WIP transfer | Tasks 1-3, 2-3 | ✅ |
| D3: CompleteTaskModal defaults to latest period | Tasks 3-3 | ✅ |
| D4: No WIP transfer on backdated periods | Task 2-3 | ✅ |
| D5: "Создана в периоде" column on Current Tasks | Task 3-4 | ✅ |
| `creation_period_id` immutable invariant | Tasks 1-2, 1-3, 2-2 | ✅ |
| UC-12 pre-deletion reset before delete | Tasks 1-3, 2-3, 3-1 | ✅ |
| Circular import mitigation (periodsAtom ↔ tasksAtom) | Task 2-3 (dynamic `import()`) | ✅ |

**TS alignment gap (non-critical):** UC-07 acceptance criteria require a **user-facing error notification** when WIP batch UPDATE fails after period creation. Task 2-3 only specifies `console.error` logging and explicitly omits rollback. The plan should either add a notification requirement to task 2-3's acceptance criteria or document the intentional deviation from UC-07.

---

## Critical Issues

**No critical issues.**

- All 13 use cases are covered.
- All 10 tasks have complete description files.
- No circular task dependencies.
- No conflicting modifications to the same method across tasks.
- All referenced file paths exist.

---

## Non-Critical Issues

1. **Task 1-3 goal/description mismatch** — Goal mentions three new DAL functions ("affected-task counting"), but only two are documented. Counting is handled in task 3-1 via `tasksByActivePeriodAtom`. Update task 1-3 goal to remove the phantom third function reference.

2. **UC-07 error notification gap** — TS requires user-facing error notification on WIP transfer failure; task 2-3 acceptance criteria only require `console.error` logging. Align task 2-3 with UC-07 or note the accepted deviation.

3. **Missing Test Cases sections** — None of the 10 task files include a **Test Cases** section. Acceptance criteria partially cover verification scenarios (especially tasks 2-1 and 2-2), but explicit test cases would improve executability.

4. **Compile-error intermediate state** — Task 1-2 notes that TypeScript will not compile until downstream tasks complete. This is expected and documented, but developers should follow strict phase ordering (complete Phase 1 + 2 before Phase 3 UI tasks that depend on renamed atoms).

---

## Final Decision

⚠️ **REVISION REQUIRED**

### Rationale:

The plan is **complete and internally consistent** for execution: all 13 use cases are mapped to tasks, all task description files exist with the required sections, file paths are valid, method signatures align across tasks, dependencies are logically ordered, and there are no file-level conflicts.

Revision is recommended (not rejection) because of two fixable TS/task inconsistencies: the phantom "affected-task counting" DAL function in task 1-3's goal, and the missing user-facing error notification in task 2-3 relative to UC-07. Neither blocks execution if developers read the TS directly, but correcting them will reduce ambiguity during implementation.
