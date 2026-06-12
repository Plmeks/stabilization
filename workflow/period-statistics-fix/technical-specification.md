# Technical Specification: Dual Period ID for Multi-Period Task Tracking

## 1. General Description

### 1.1 Problem Statement

The Stability application has a critical architectural bug: every task has a single `period_id` field that hard-anchors it to the period in which it was created. When tasks span multiple periods (created in Period A, worked on in Period B), all statistics are attributed solely to Period A. This renders period-level metrics meaningless for any real-world workflow where work crosses period boundaries.

### 1.2 Goal

Introduce dual period tracking on the `tasks` table — `creation_period_id` (immutable, historical) and `active_period_id` (mutable, drives statistics) — so that:

- The QA tab preserves full backlog history grouped by the period in which each task was originally created.
- WIP and resolved metrics are attributed to the correct (current) period.
- Cumulative metrics continue to operate correctly.
- All 15 statistics metrics produce accurate results in multi-period scenarios.

### 1.3 Relation to Existing System

This is a modification of the existing database schema, TypeScript types, DAL functions, statistics calculation logic, Jotai atoms, and several UI components. The single `period_id` column is replaced by two columns; every layer that reads or writes `period_id` must be updated.

---

## 2. List of Use Cases

### UC-01: Create a New Task (Modification of existing)

**Actors:** User, System

**Preconditions:**
- At least one period exists.
- User is on the QA tab.

**Main Scenario:**
1. User clicks "Добавить задачу" on a period section (or the general Add button).
2. System displays the AddTaskModal with a period selector.
3. User fills in the title, optionally sets priority and link, selects a period.
4. User clicks "Создать".
5. System creates a new task with:
   - `creation_period_id = selected period` *(changed: was `period_id`)*
   - `active_period_id = selected period` *(new: same as creation period at creation time)*
   - `status = null`, `assignee = null`, `taken_into_work_at = null`, `completed_at = null`
6. System displays the new task in the selected period's section on the QA tab.

**Alternative Scenarios:**

**A1: Empty title (at step 4)**
1. System prevents submission (existing validation behavior).
2. User corrects the input.
3. Return to step 4.

**Postconditions:**
- Task created in the database with `creation_period_id = active_period_id = selected period`.
- Task is visible on the QA tab under the selected period.

**Acceptance Criteria:**
- ✅ `creation_period_id` and `active_period_id` are both set to the selected period on creation.
- ✅ Task appears under the correct period on the QA tab.
- ✅ No change to user-visible creation flow (fields, layout, modals remain the same).

---

### UC-02: Take Task into Work (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Task exists with `status = null` (in backlog).
- At least one period exists.

**Main Scenario:**
1. User clicks "Взять в работу" on a task in the QA tab.
2. System determines the **latest period** (the period with the most recent `start_date`; if tied, the most recent `end_date`).
3. System updates the task:
   - `status = 'В работе'`
   - `taken_into_work_at = now()`
   - `priority = 'Нормальный'` if priority was null *(existing behavior)*
   - `active_period_id = latest period ID` *(new)*
   - `creation_period_id` remains unchanged *(new invariant)*
4. Task appears in the "Текущие задачи" tab.
5. Task remains visible on the QA tab under its `creation_period_id`, highlighted as "in work" *(existing behavior)*.
6. Dynamic statistics for the latest period update: `in_progress` increments.

**Alternative Scenarios:**

**A1: No periods exist (at step 2)**
1. This situation should not occur because tasks cannot exist without periods (FK constraint on `creation_period_id`).

**A2: Task's creation period is also the latest period (at step 2)**
1. `active_period_id` is set to the same value as `creation_period_id`. No observable difference from current behavior.

**Postconditions:**
- Task status is `'В работе'`, `active_period_id` = latest period.
- Task contributes to the latest period's WIP statistics.
- Task remains in its creation period's section on the QA tab.

**Acceptance Criteria:**
- ✅ Taking a task from Period A's backlog into work when Period B is the latest period sets `active_period_id = Period B`.
- ✅ Period B's dynamic `in_progress` metric increments.
- ✅ Period A's `added_to_backlog` count is unaffected (still counts tasks by `creation_period_id`).
- ✅ The "take into work" action remains a single click (no period selection modal added).
- ✅ `creation_period_id` is never modified by this action.

---

### UC-03: Complete a Task (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Task exists with an active status (`'В работе'`, `'В тесте'`, or `'Блокер'`).

**Main Scenario:**
1. User opens the EditTaskModal for an active task on the "Текущие задачи" tab.
2. User changes status to `'Завершена'`.
3. System displays the CompleteTaskModal asking the user to select a period for archival.
4. System pre-selects the **latest period** (the most recent period by `start_date`) as the default. *(Decision: always default to latest period, matching existing behavior.)*
5. User optionally changes the period and clicks "Завершить".
6. System updates the task:
   - `status = 'Завершена'`
   - `completed_at = now()`
   - `active_period_id = selected period` *(changed: was `period_id`)*
   - `creation_period_id` remains unchanged *(new invariant)*
7. Task moves from "Текущие задачи" to "Выполненные" tab.
8. Task appears under the selected period's section on the "Выполненные" tab.
9. Dynamic statistics update: WIP decrements for the previous `active_period_id`; `resolved_total` increments for the selected period.

**Alternative Scenarios:**

**A1: User cancels completion modal (at step 5)**
1. Modal closes.
2. Task remains with its previous status.

**A2: Task completed in the same period as its current active_period_id (at step 5)**
1. `active_period_id` unchanged. WIP decrements and resolved increments in the same period. Normal flow.

**Postconditions:**
- Task is completed with `active_period_id` set to the user-selected period.
- `creation_period_id` remains unchanged.

**Acceptance Criteria:**
- ✅ CompleteTaskModal pre-selects the **latest period** as default (not `active_period_id`).
- ✅ `active_period_id` is updated to the selected period.
- ✅ `creation_period_id` is never modified.
- ✅ The task appears under the correct period on the "Выполненные" tab (grouped by `active_period_id`).
- ✅ Statistics update correctly for both the previous and selected periods.

---

### UC-04: Return Task from Completed to QA (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Task exists with `status = 'Завершена'`.
- User is on the "Выполненные" tab.

**Main Scenario:**
1. User clicks "Вернуть в QA" (Undo2 icon) on a completed task.
2. System displays a confirmation dialog.
3. User confirms.
4. System updates the task:
   - `status = null`
   - `taken_into_work_at = null`
   - `completed_at = null`
   - `assignee = null`
   - `active_period_id = creation_period_id` *(new: resets to original period)*
   - `priority` is retained *(existing behavior)*
   - `creation_period_id` remains unchanged *(new invariant)*
5. Task disappears from "Выполненные" tab.
6. Task appears on the QA tab under its `creation_period_id` section, as an unworked backlog item.
7. Dynamic statistics update: `resolved_total` decrements for the period the task was completed in.

**Alternative Scenarios:**

**A1: User cancels confirmation (at step 3)**
1. Dialog closes. No changes.

**Postconditions:**
- Task is returned to the backlog state with `active_period_id = creation_period_id`.
- Task appears in the QA tab under its original creation period.

**Acceptance Criteria:**
- ✅ Returning to QA resets `active_period_id` to `creation_period_id`.
- ✅ Task appears under its original creation period on the QA tab.
- ✅ All work-related fields are cleared (status, assignee, timestamps).
- ✅ Priority is preserved.
- ✅ `creation_period_id` is never modified.
- ✅ Statistics recalculate correctly after return.

---

### UC-05: Return Task from Completed to Work (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Task exists with `status = 'Завершена'`.
- User is on the "Выполненные" tab and opens the EditTaskModal.

**Main Scenario:**
1. User opens EditTaskModal for a completed task.
2. User changes status to a non-completed status (e.g. `'В работе'`, `'В тесте'`, `'Блокер'`).
3. User clicks "Сохранить".
4. System determines the **latest period**.
5. System updates the task:
   - `status = selected status`
   - `completed_at = null`
   - Other fields as specified in the form
   - `active_period_id = latest period` *(new)*
   - `creation_period_id` remains unchanged *(new invariant)*
6. Task moves from "Выполненные" to "Текущие задачи" tab.

**Alternative Scenarios:**

**A1: User selects 'Завершена' again (at step 2)**
1. This is a regular update, not a return to work. `active_period_id` unchanged.

**Postconditions:**
- Task is back in active work with `active_period_id` = latest period.
- `creation_period_id` unchanged.

**Acceptance Criteria:**
- ✅ Returning a completed task to work sets `active_period_id` to the latest period.
- ✅ Task appears in the latest period's WIP statistics.
- ✅ `creation_period_id` is never modified.

---

### UC-06: Return Task from Current to QA (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Task exists with an active status (`'В работе'`, `'В тесте'`, or `'Блокер'`).
- User is on the "Текущие задачи" tab.

**Main Scenario:**
1. User clicks "Вернуть в QA" (Undo2 icon) on an active task.
2. System displays a confirmation dialog.
3. User confirms.
4. System updates the task:
   - `status = null`
   - `taken_into_work_at = null`
   - `completed_at = null`
   - `assignee = null`
   - `active_period_id = creation_period_id` *(new: resets to original period)*
   - `priority` is retained *(existing behavior)*
   - `creation_period_id` remains unchanged *(new invariant)*
5. Task disappears from "Текущие задачи" tab.
6. Task appears on the QA tab under its `creation_period_id` section.

**Alternative Scenarios:**

**A1: User cancels confirmation (at step 3)**
1. Dialog closes. No changes.

**Postconditions:**
- Task is returned to backlog with `active_period_id = creation_period_id`.

**Acceptance Criteria:**
- ✅ Returning to QA from Current tab resets `active_period_id` to `creation_period_id`.
- ✅ Task appears under its original creation period on the QA tab.
- ✅ WIP statistics for the previous `active_period_id` decrement.

---

### UC-07: Create a New Period (Modification of existing)

**Actors:** User, System

**Preconditions:**
- User is on the QA tab.

**Main Scenario:**
1. User clicks "Добавить период".
2. System displays CreatePeriodModal.
3. User enters start_date and end_date.
4. User clicks "Создать".
5. System creates the period in the database (DAL call).
6. System checks whether the newly created period is the **latest period** (most recent `start_date`, ties broken by `end_date`).
7. If the new period IS the latest: system identifies all tasks with WIP statuses (`status IN ('В работе', 'В тесте', 'Блокер')`).
8. System performs a **sequential batch UPDATE** to set `active_period_id = new period ID` for all identified WIP tasks. *(Decision: two sequential application-level calls — period INSERT then batch UPDATE — with JS-level error handling. Simplicity preferred over strict atomicity.)*
9. New period appears in the list.
10. Dynamic statistics for the new period immediately reflect the transferred WIP tasks.

**Alternative Scenarios:**

**A1: No WIP tasks exist (at step 7)**
1. No tasks to transfer. Period is created normally.

**A2: Multiple WIP tasks from different creation periods (at step 7)**
1. All WIP tasks get `active_period_id` = new period, regardless of their `creation_period_id`.
2. Each task retains its `creation_period_id`.

**A3: New period is NOT the latest by start_date (e.g. creating a backdated period) (at step 6)**
1. No WIP transfer occurs. *(Decision: confirmed — only transfer when the new period is the latest. Backdated periods are exceptional.)*
2. Period is created normally without any task transfers.

**A4: Batch UPDATE fails after period INSERT succeeds (at step 8)**
1. Period exists but WIP tasks are not transferred.
2. System logs the error and shows a user-facing error notification.
3. The user can manually retry or the tasks will be transferred on the next period creation that becomes the latest.
4. *(Decision: accept this risk with JS error handling rather than requiring DB-level transaction.)*

**Postconditions:**
- New period exists.
- If the new period is the latest: all WIP tasks are now associated with it via `active_period_id`.
- Previous periods' dynamic WIP metrics drop to 0 (tasks transferred out).
- New period's dynamic WIP metrics reflect all currently active tasks.

**Acceptance Criteria:**
- ✅ Creating a new period that is the latest automatically transfers all WIP tasks via `active_period_id`.
- ✅ `creation_period_id` of transferred tasks is not modified.
- ✅ The new period's WIP statistics immediately reflect the transferred tasks.
- ✅ Previous period's dynamic WIP statistics drop (tasks no longer associated).
- ✅ If previous period's statistics were locked, the locked snapshot is unaffected.
- ✅ Backlog tasks (status = null) are NOT transferred.
- ✅ If the new period is backdated (not the latest), no WIP transfer occurs.
- ✅ If the batch UPDATE fails, the error is handled gracefully (error notification, no crash).

---

### UC-08: Calculate Dynamic Metrics for a Period (Modification of existing)

**Actors:** System

**Preconditions:**
- Period exists.
- Tasks exist in the system.

**Main Scenario:**
1. System receives a request to calculate dynamic metrics for a period (e.g. Stats tab rendering).
2. System calculates **"added" metrics** by filtering tasks where `creation_period_id = period.id`:
   - `added_to_backlog` = count of tasks with `creation_period_id = period.id`
   - `added_critical` = count where additionally `priority = 'Авария'`
   - `added_non_critical` = count where additionally `priority != 'Авария'`
3. System calculates **"resolved" metrics** by filtering tasks where `active_period_id = period.id AND status = 'Завершена'`:
   - `resolved_total` = count
   - `resolved_critical` = count where additionally `priority = 'Авария'`
   - `resolved_non_critical` = count where additionally `priority != 'Авария'`
4. System calculates **WIP metrics** by filtering tasks where `active_period_id = period.id AND status IN ('В работе', 'В тесте', 'Блокер')`:
   - `in_progress` = count where `status = 'В работе'`
   - `in_testing` = count where `status = 'В тесте'`
   - `in_block` = count where `status = 'Блокер'`
   - `wip_total` = `in_progress + in_testing`
5. System calculates **cumulative metrics** by collecting all tasks where `creation_period_id` belongs to this period or any earlier period (sorted by `start_date`):
   - `total_problems_cumulative` = count of all such tasks
   - `completed_cumulative` = count where `status = 'Завершена'`
   - `uncompleted` = `total_problems_cumulative - completed_cumulative`
   - `uncompleted_critical` = count where `status != 'Завершена' AND priority = 'Авария'`
   - `uncompleted_non_critical` = count where `status != 'Завершена' AND priority != 'Авария'`

**Alternative Scenarios:**

**A1: Period has no tasks (at step 2)**
1. All metrics are 0.

**A2: Period has locked statistics**
1. Locked metrics are displayed instead of dynamic ones (existing behavior, no change).

**Postconditions:**
- 15 metrics are computed and returned.

**Acceptance Criteria:**
- ✅ "Added" metrics use `creation_period_id` (count tasks originally created in the period).
- ✅ "Resolved" and WIP metrics use `active_period_id` (count tasks currently active/completed in the period).
- ✅ Cumulative metrics use `creation_period_id` for the "up to this period" logic.
- ✅ All 15 metrics match expected values in the multi-period scenario described in the task description.
- ✅ Metrics calculation with example scenario:
  - Period A: `added_to_backlog=3` (3 tasks created), `in_progress=0` (WIP transferred to B), `resolved_total=1`
  - Period B: `added_to_backlog=0` (no tasks created), `in_progress=1` (1 WIP from A), `resolved_total=0`
  - Taking Period A backlog task into work: Period B `in_progress=2`

---

### UC-09: Display Tasks on QA Tab (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Periods and tasks exist.

**Main Scenario:**
1. User navigates to the QA tab.
2. System loads all tasks and periods.
3. System groups **all tasks** by `creation_period_id` *(changed: was `period_id`)*.
4. System renders each period as a collapsible section with its tasks.
5. Tasks with `status != null` (taken into work or completed) are highlighted *(existing behavior)*.
6. Tasks with `status = null` show the "Взять в работу" button *(existing behavior)*.

**Postconditions:**
- QA tab displays all tasks grouped by their creation period.

**Acceptance Criteria:**
- ✅ Tasks are grouped by `creation_period_id`, not `active_period_id`.
- ✅ A task created in Period A remains visible under Period A even after being taken into work in Period B.
- ✅ A task returned to QA appears under its original creation period.
- ✅ Period task counts and critical counts are based on `creation_period_id`.

---

### UC-10: Display Tasks on Completed Tab (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Completed tasks exist.

**Main Scenario:**
1. User navigates to the "Выполненные" tab.
2. System loads all tasks with `status = 'Завершена'`.
3. System groups completed tasks by `active_period_id` *(changed: was `period_id`)*.
4. System renders each period as a collapsible section.

**Alternative Scenarios:**

**A1: No completed tasks**
1. System displays "Нет выполненных задач" *(existing behavior)*.

**Postconditions:**
- Completed tab displays tasks grouped by the period they were completed/archived in.

**Acceptance Criteria:**
- ✅ Completed tasks are grouped by `active_period_id`.
- ✅ A task created in Period A but completed in Period B appears under Period B on the Completed tab.

---

### UC-11: Edit Task Fields (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Task exists. User opens EditTaskModal.

**Main Scenario:**
1. User modifies task fields (title, assignee, priority, link, status) in the EditTaskModal.
2. User clicks "Сохранить".
3. System updates the modified fields.
4. Neither `creation_period_id` nor `active_period_id` are changed by a simple field edit *(unless the status change triggers UC-03 or UC-05 flows)*.

**Postconditions:**
- Task fields are updated. Period associations unchanged.

**Acceptance Criteria:**
- ✅ Simple field edits (title, assignee, priority, link) do not modify `creation_period_id` or `active_period_id`.
- ✅ Status change to 'Завершена' triggers UC-03 flow.
- ✅ Status change from 'Завершена' to a work status triggers UC-05 flow.

---

### UC-12: Delete a Period (Modification of existing)

**Actors:** User, System

**Preconditions:**
- Period exists.

**Main Scenario:**
1. User clicks delete on a period in the QA tab.
2. System counts tasks that will be **permanently deleted** (tasks with `creation_period_id = this period`).
3. System counts tasks that will be **affected** (tasks from other creation periods that have `active_period_id = this period`).
4. System shows a confirmation dialog with:
   - Count of tasks that will be deleted.
   - If affected tasks exist: a warning that those tasks will have their `active_period_id` reset to their creation period. *(Decision: no FK constraint on `active_period_id` — application-level handling with user warning.)*
5. User confirms.
6. System resets `active_period_id = creation_period_id` for all tasks where `active_period_id = this period AND creation_period_id != this period`.
7. System deletes the period. Due to `ON DELETE CASCADE` on `creation_period_id`:
   - All tasks with `creation_period_id = deleted period` are deleted.
   - Tasks from other creation periods are safe (their `active_period_id` was reset in step 6).

**Alternative Scenarios:**

**A1: No cross-period active references (at step 3)**
1. No affected tasks. Confirmation dialog only shows deletion count. Proceed to step 5.

**A2: Tasks from other periods are in WIP with active_period_id = deleted period (at step 6)**
1. Those tasks get `active_period_id` reset to `creation_period_id`.
2. Their WIP status is unchanged (they remain in work), but now contribute to their creation period's WIP stats.

**A3: Reset fails before deletion (at step 6)**
1. System shows error notification.
2. Period is NOT deleted. User can retry.

**Postconditions:**
- Period and its originally-created tasks are deleted.
- Tasks from other periods that were only working in the deleted period are safely returned to their creation period.

**Acceptance Criteria:**
- ✅ Deleting a period does not orphan tasks whose `creation_period_id` points to a different period.
- ✅ Tasks with `creation_period_id = deleted period` are cascade-deleted.
- ✅ Tasks with only `active_period_id = deleted period` have `active_period_id` reset before deletion.
- ✅ The confirmation dialog shows how many tasks will be **deleted** (by `creation_period_id`).
- ✅ If tasks from other periods are affected, a warning is displayed.
- ✅ If the pre-deletion reset fails, the period is not deleted.

---

### UC-13: Display Creation Period on Current Tasks Tab (New)

**Actors:** User, System

**Preconditions:**
- Active tasks exist (status IN `'В работе'`, `'В тесте'`, `'Блокер'`).
- User is on the "Текущие задачи" tab.

**Main Scenario:**
1. User navigates to the "Текущие задачи" tab.
2. System renders the `CurrentTasksTable` with all active tasks.
3. Each task row displays a new **"Создана в периоде"** column *(new)*.
4. The column shows the task's creation period dates in a **compact text format** (no badge, no pill), with a line break between start and end dates:
   ```
   01.05.2026 -
   07.05.2026
   ```
5. The column is **narrow** with text wrapping allowed.
6. All other columns remain unchanged *(existing behavior)*.

**Alternative Scenarios:**

**A1: Task's creation_period_id references a period that was deleted (at step 3)**
1. This cannot happen: `creation_period_id` has `ON DELETE CASCADE` — if the creation period is deleted, the task is also deleted.

**Postconditions:**
- Current Tasks table displays the creation period for each task.

**Acceptance Criteria:**
- ✅ A new "Создана в периоде" column is visible in the `CurrentTasksTable`.
- ✅ The column shows dates formatted as `DD.MM.YYYY - DD.MM.YYYY` with a line break after the dash.
- ✅ The column uses compact plain text (no badge/pill styling).
- ✅ The column is narrow and allows text wrapping.
- ✅ The column correctly displays the creation period (via `creation_period_id`), even when the task's `active_period_id` differs.
- ✅ Existing columns and their behavior are unchanged.

---

## 3. Non-Functional Requirements

### 3.1 Performance
- The `calculateDynamicMetrics` function must remain fast. It is called for every period on the Stats tab render. The dual-column filtering should not introduce noticeable latency for typical datasets (< 1000 tasks, < 50 periods).
- Database indexes should be created for both `creation_period_id` and `active_period_id`.

### 3.2 Data Integrity
- `creation_period_id` must never be `NULL`. It is set at creation and never modified.
- `active_period_id` must never be `NULL`. It is set at creation and updated on lifecycle transitions.
- `creation_period_id` has a foreign key constraint to `periods.id` with `ON DELETE CASCADE` (deleting the creation period deletes the task — same as current `period_id` behavior).
- `active_period_id` has **no foreign key constraint**. *(Decision: application-level enforcement only. No DB-level FK on `active_period_id`. The application handles resets before period deletion and warns the user.)* This keeps the schema simple and avoids complications with CASCADE vs RESTRICT strategies.

### 3.3 Migration
- All schema changes consolidated into `supabase/migrations/001_create_tables.sql` (complete schema replacement, not incremental). User manually drops all tables before running.

---

## 4. Constraints and Assumptions

### 4.1 Constraints
- **Single migration file**: All schema goes into `supabase/migrations/001_create_tables.sql`. No incremental migrations.
- **Manual table drop**: User manually deletes all Supabase tables before re-running the migration.
- **No tests**: User explicitly requested no tests.
- **No excessive documentation**: Focus on code, not docs.

### 4.2 Assumptions

1. **"Latest period" definition**: The latest period is determined by sorting all periods by `start_date` descending (ties broken by `end_date` descending) and taking the first. This is the same sort order already used by `periodsAtom`.

2. **Backlog tasks are NOT transferred on period creation**: Only WIP tasks (`status IN ('В работе', 'В тесте', 'Блокер')`) have `active_period_id` updated when a new period is created. Backlog tasks remain associated with their creation period.

3. **Return to QA always resets to creation period**: When a task is returned to QA (from either Current or Completed tab), `active_period_id` resets to `creation_period_id`. The task returns to its original period's backlog.

4. **Return to Work from Completed sets latest period**: When a completed task's status is changed back to a work status via EditTaskModal, `active_period_id` is set to the latest period.

5. **Completed tab groups by `active_period_id`**: Completed tasks are grouped by the period they were archived/completed in (the `active_period_id` at time of completion), not their creation period.

6. **Locked statistics are snapshots and are not recalculated**: If Period A's statistics were locked, then a new period is created and WIP tasks transfer out, the locked snapshot for Period A remains unchanged. This is existing behavior and is correct (snapshots are point-in-time).

7. **Period dates may overlap**: The system does not enforce non-overlapping period dates. The "latest period" heuristic uses sort order, not date range containment.

8. **No FK on `active_period_id`**: The database does not enforce referential integrity for `active_period_id`. The application is responsible for resetting it before period deletion and maintaining consistency.

9. **WIP transfer uses sequential calls**: Period creation and WIP task transfer are two separate application-level operations (INSERT + batch UPDATE). If the UPDATE fails after INSERT succeeds, the period exists but tasks are not transferred. This is an accepted trade-off for simplicity.

10. **No WIP transfer on backdated periods**: WIP task transfer only occurs when the newly created period is the latest period. Creating a period with dates earlier than the existing latest period does not trigger any task transfer.

11. **CompleteTaskModal defaults to latest period**: The period selector in the completion modal pre-selects the latest period (by `start_date`), not `task.active_period_id`. This matches existing behavior.

### 4.3 Design Decisions (resolved from user feedback)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | No FK constraint on `active_period_id` | Application-level checks with user warning. Simplicity preferred. |
| D2 | Sequential app-level calls for WIP transfer | Period INSERT + batch UPDATE, JS error handling. No DB transaction needed. |
| D3 | CompleteTaskModal defaults to latest period | Matches existing behavior. User confirmed. |
| D4 | No WIP transfer on backdated periods | Backdated periods are exceptional. Only transfer when new period is latest. |
| D5 | Add "Создана в периоде" column to Current Tasks tab | Compact text, line break between dates, narrow column with text wrapping. |

---

## 5. Open Questions

*All previously blocking questions have been resolved (see Section 4.3). No remaining blocking questions.*

---

## 6. Anticipated Architecture Questions

1. **Index strategy**: The current migration creates `idx_tasks_period_id`. This must be replaced with indexes on `creation_period_id` and `active_period_id`. Consider whether composite indexes (e.g. `(active_period_id, status)`) would benefit `calculateDynamicMetrics` queries. Currently all filtering is done in JS (all tasks loaded into memory), so DB indexes primarily help if the application later moves filtering server-side.

2. **Optimistic updates and period resolution**: `takeIntoWorkAtom` currently receives only the task ID. With the new model, it needs to know the latest period ID for the optimistic update. Options: (a) Read `periodsAtom` within the atom (it already has access via `get`). (b) Pass the latest period ID as an argument from the UI component. The architect should decide which is cleaner.

3. **Derived atoms refactoring**: `tasksByPeriodAtom` groups by `period_id`. It needs to become either `tasksByCreationPeriodAtom` (for QA tab) or be supplemented by a `tasksByActivePeriodAtom` (for Completed tab, stats). The architect should decide the atom structure.

4. **DAL function signatures**: `returnTaskToQA` needs to reset `active_period_id = creation_period_id`. Since the DAL can read the current `creation_period_id` from the DB record, it could do this in a single UPDATE using a self-referencing SET clause: `UPDATE tasks SET active_period_id = creation_period_id WHERE id = $1`. This avoids needing to pass the creation_period_id from the atom layer. However, the Supabase JS client may not support column self-references in `.update()`. The architect should investigate whether raw SQL (via `.rpc()`) is needed or if the JS client can handle this.

5. **`returnTaskToWork` DAL changes**: This function takes `(id, UpdateTaskInput)`. It now also needs to set `active_period_id`. Should this be part of `UpdateTaskInput` (making the type aware of period tracking) or handled as a separate parameter? If it's part of `UpdateTaskInput`, the type changes are larger. If separate, the function signature changes.

6. **WIP transfer DAL function**: The batch UPDATE for WIP transfer on period creation needs a new DAL function (e.g. `transferWipTasks(newPeriodId: string)`). This function should UPDATE all tasks where `status IN ('В работе', 'В тесте', 'Блокер')` to set `active_period_id = newPeriodId`. The architect should design the function signature and error handling.

7. **Period deletion pre-reset DAL function**: Before deleting a period, the application needs to reset `active_period_id = creation_period_id` for all tasks where `active_period_id = periodToDelete AND creation_period_id != periodToDelete`. This requires a new DAL function (e.g. `resetActivePeriodForDeletion(periodId: string)`). Since `active_period_id` has no FK constraint, if this reset is missed, those tasks will have a dangling `active_period_id` (referencing a deleted period). The architect should ensure this is called reliably.

8. **Type migration — `period_id` references across the codebase**: Every reference to `task.period_id` must be replaced with either `task.creation_period_id` or `task.active_period_id` depending on context. The architect should produce a mapping of every callsite:
   - `CreateTaskInput.period_id` → `creation_period_id` (and set `active_period_id` to same value)
   - `CompletionInput.period_id` → `active_period_id`
   - QA page filtering `t.period_id === period.id` → `t.creation_period_id`
   - Completed page grouping `task.period_id` → `task.active_period_id`
   - `tasksByPeriodAtom` key `task.period_id` → `task.creation_period_id`
   - `completeTaskAtom` optimistic update `period_id: input.period_id` → `active_period_id: input.active_period_id`
   - `CompleteTaskModal` default → latest period (not `task.active_period_id`)
   - `calculateDynamicMetrics` — split filtering as described in UC-08

9. **"Создана в периоде" column placement**: The `CurrentTasksTable` component needs a new column. The architect should decide its position in the table (e.g. after "Приоритет" or before "Действия") and whether the `periods` data needed to resolve `creation_period_id` → date strings should be passed as a prop or resolved via atom lookup within the component.
