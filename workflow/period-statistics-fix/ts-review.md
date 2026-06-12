# TS Review: Dual Period ID for Multi-Period Task Tracking

**Date:** 2026-06-12  
**Reviewer:** AI Agent  
**Status:** NEEDS REVISION

## Overall Assessment

The technical specification is strong overall. It correctly adopts the dual-period-ID approach (`creation_period_id` + `active_period_id`), covers the core user scenario from the task description, resolves the "return task" design question, and maps metric calculation rules to the right field for each of the 15 statistics. Use cases UC-01 through UC-12 align well with the existing Stability architecture (Jotai atoms, DAL, `calculateDynamicMetrics`, tab grouping).

However, several internal inconsistencies and gaps remain — most notably a false claim that CompleteTaskModal behavior is unchanged, missing atom-layer update requirements in use cases, and incomplete statistics acceptance criteria for return flows. These should be fixed before architecture to avoid incorrect UI defaults and stale optimistic state during implementation.

## Critical Issues (🔴 BLOCKING)

None identified. The TS covers all mandatory scope items (schema, types, DAL, stats, atoms, UI) and the dual-period model is architecturally sound.

## Major Issues (🟡 MAJOR)

### 1. CompleteTaskModal default contradicts actual current behavior

**Location:** UC-03 (steps 117, 141–142), Assumption 11, Decision D3

**Problem:** The TS states that CompleteTaskModal pre-selects the **latest period** and that this "matches existing behavior." In the current codebase, `EditTaskModal` passes `defaultPeriodId={task.period_id}` — i.e., the task's single creation-period anchor, not the latest period.

**Why this matters:** The architect may treat "matches existing behavior" literally and miss a required UI change. Conversely, if latest-period default is correct (likely for dual-ID statistics), the TS must not describe it as unchanged behavior. This also partially conflicts with the task's "Maintain all current UI/UX behavior" unless the intentional UX change is explicitly called out as a deliberate deviation.

**Recommendation:** Remove all "matches existing behavior" wording for CompleteTaskModal. State clearly: **current behavior** = defaults to creation period (`task.period_id`); **new behavior** = defaults to latest period (Decision D3). Update UC-03 acceptance criteria to reference Decision D3 explicitly rather than "existing behavior."

---

### 2. Jotai atom optimistic updates not covered in use cases

**Location:** Section 2 (all lifecycle UCs); Section 6 item 2

**Problem:** Section 6 notes that `takeIntoWorkAtom`, `completeTaskAtom`, `returnToQAAtom`, `returnTaskToWorkAtom`, and `createPeriodAtom` must update `active_period_id` in optimistic paths, but no use case describes this. Current atoms only mutate `period_id` / status / timestamps.

**Why this matters:** Without UC-level requirements, the planner may update DAL only and leave optimistic UI state inconsistent with server state until refetch — causing wrong stats on the Stats tab and wrong grouping on Completed tab during the optimistic window.

**Recommendation:** Add acceptance criteria to UC-02, UC-03, UC-04, UC-05, UC-06, and UC-07 stating that the corresponding Jotai atoms must optimistically update `active_period_id` (and preserve `creation_period_id`) in sync with DAL behavior.

---

### 3. UC-04 statistics impact underspecified

**Location:** UC-04, step 7 and Acceptance Criteria

**Problem:** Step 7 only mentions `resolved_total` decrement for "the period the task was completed in." It does not name the field used (`active_period_id` before reset), nor specify that no WIP metrics change (task returns to backlog). Acceptance criterion "Statistics recalculate correctly after return" is not measurable.

**Why this matters:** Return-from-completed is the exact scenario raised in the task description ("куда она вернется?"). Ambiguous stats rules here will cause incorrect metric updates during development.

**Recommendation:** Specify explicitly: decrement `resolved_total` (and critical/non-critical resolved) for the task's **pre-reset** `active_period_id`; after reset, task contributes only to creation period's `added_to_backlog` count (unchanged); WIP metrics unchanged. Replace vague acceptance criterion with concrete before/after metric values (mirror UC-08 example style).

---

### 4. UC-07 partial-failure recovery path incomplete

**Location:** UC-07, Alternative A4 (steps 301–304)

**Problem:** If period INSERT succeeds but WIP batch UPDATE fails, the TS says tasks transfer "on the next period creation that becomes the latest." No mechanism exists for retry on the **same** latest period (e.g., user cannot create another latest period without deleting the failed one). The system may remain in a permanently inconsistent state.

**Why this matters:** Accepted trade-off (D2) is documented, but the recovery story is incomplete. Developers may not implement any user-visible recovery or admin retry.

**Recommendation:** Either (a) add an alternative scenario / acceptance criterion for manual retry (e.g., re-invoke transfer when opening Stats tab or a one-time repair on app load), or (b) explicitly state that the user must delete and recreate the period to retry, and document the resulting data loss implications.

---

### 5. UC-12 period deletion flow requires atom/DAL orchestration not traced to implementation layer

**Location:** UC-12; current `deletePeriodAtom` in `periodsAtom.ts`

**Problem:** UC-12 describes a two-step pre-reset + delete flow with new DAL function `resetActivePeriodForDeletion`. The current `deletePeriodAtom` calls `deletePeriod(id)` directly with no reset step. The TS does not specify which atom owns the orchestration or how optimistic task state is updated after reset.

**Why this matters:** Without atom-level requirements, implementation may add DAL functions but leave `deletePeriodAtom` unchanged, causing FK-safe deletion for `creation_period_id` but leaving dangling `active_period_id` values (no DB FK) for cross-period WIP tasks.

**Recommendation:** Add acceptance criteria to UC-12: `deletePeriodAtom` must call reset DAL before delete; optimistic `tasksAtom` update must set `active_period_id = creation_period_id` for affected tasks before period removal.

---

### 6. Schema migration details absent from use cases

**Location:** Section 3.2–3.3; missing UC for migration

**Problem:** NFRs state consolidation into `001_create_tables.sql` and index requirements, but the TS never shows the target column definitions (replacing `period_id` with `creation_period_id` + `active_period_id`, replacing `idx_tasks_period_id` with two indexes). TypeScript/Supabase client type updates are deferred entirely to Section 6.

**Why this matters:** This is a breaking schema replacement. Missing explicit schema spec increases risk of architect/planner omitting `src/lib/supabase/client.ts` Row types or leaving stale `period_id` in generated types.

**Recommendation:** Add a brief UC-14 or expand Section 3.3 with exact column DDL, index names, and a checklist of type files (`types/index.ts`, `client.ts`, input types) that must drop `period_id` entirely.

---

### 7. UC-05 missing lifecycle field rules

**Location:** UC-05, Main Scenario step 5

**Problem:** When a completed task is returned to work via EditTaskModal, the TS updates `status`, clears `completed_at`, sets `active_period_id = latest period`, but does not specify behavior for `taken_into_work_at` or `assignee`.

**Why this matters:** Current `returnTaskToWork` preserves existing `taken_into_work_at`. If assignee was set at completion, unclear whether it persists. Inconsistent field handling affects Current tab "Дата взятия" display and WIP semantics.

**Recommendation:** Explicitly state which fields are preserved vs. reset in UC-05 (likely: preserve `taken_into_work_at` and `assignee` to match current behavior; only update `active_period_id` and clear `completed_at`).

## Minor Issues (🟢 MINOR)

### 1. UC-13 adds UI not listed in original task scope

**Location:** UC-13, Decision D5

**Recommendation:** UC-13 (new "Создана в периоде" column) is documented as user-confirmed (D5) but was not in the original task description's scope list. Add a note in Section 1.2 that this is an approved UX enhancement beyond the minimal fix, to prevent scope debate during planning.

---

### 2. Dead `period` props in table components not addressed

**Location:** UC-13; `CurrentTasksTable.tsx`, `CompletedTasksTable.tsx`

**Recommendation:** Both tables pass a `period` prop to row components that do not render it. Note whether UC-13 replaces this dead prop or whether it should be removed during refactor.

---

### 3. "Latest period" tie-breaking wording inconsistent

**Location:** UC-02 step 2 vs UC-07 step 6 vs Assumption 1

**Recommendation:** UC-02 says "most recent `start_date`; if tied, the most recent `end_date`" while Assumption 1 references descending sort on both fields (consistent with `periodsAtom`). Clarify tie-breaking uses **descending** `end_date` (largest/latest end date wins), not ambiguous "most recent."

---

### 4. Open Questions section claims full resolution without traceability

**Location:** Section 5

**Recommendation:** Section 5 states all blocking questions resolved via Section 4.3, but the original project-context question about return-to-QA is answered in UC-04/UC-06, not in 4.3. Cross-reference UC numbers in Section 5 for traceability.

---

### 5. UC-08 example omits locked-vs-dynamic distinction for Period A `in_progress`

**Location:** UC-08, Acceptance Criteria (lines 370–373)

**Recommendation:** The example correctly shows Period A dynamic `in_progress=0` after WIP transfer. Add one line clarifying that if Period A metrics were **locked** before transfer, locked snapshot still shows `in_progress=1` (per Assumption 6) — prevents confusion with the example values.

## Final Recommendation

**RETURN FOR REVISION**

The TS is suitable as a foundation and correctly addresses the core architectural bug, dual-period model, migration constraint, return-task design, and all 15 metrics. Revise the major issues above — especially the CompleteTaskModal behavior contradiction and atom-layer optimistic update requirements — before proceeding to architecture.
