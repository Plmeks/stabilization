# Technical Specification: Expanded Statistics System with Cumulative Metrics

## 1. General Description

### Goal
Expand the statistics system to include cumulative metrics, fix incorrect "Добавлено в бэклог" calculation logic, add a comment field per period (available after metrics are locked), and restructure the UI into logical metric groups.

### Relation to Existing System
This enhances the existing `/stats` page and `period_statistics` table. The current system has 6 flat metrics per period. The new system expands to ~15 metrics organized in logical sections, adds cumulative cross-period calculations, and introduces a free-text comment field tied to locked statistics.

### Summary of Changes
1. **Bug fix**: "Добавлено в бэклог" should count ALL tasks for a period, not just those taken into work
2. **New metrics**: Cumulative totals, WIP breakdown, period performance with critical/non-critical splits
3. **New field**: Comment textarea with debounced auto-save (available only after metrics are locked)
4. **UI restructure**: Group metrics into logical sections

---

## 2. Use Cases

### UC-1: View Dynamic Statistics with Corrected "Добавлено" Logic (Modification)

**Actors:** User, System  
**Preconditions:** At least one period exists with tasks  

**Main Scenario:**
1. User navigates to `/stats` tab
2. System loads all periods, tasks, and locked statistics
3. For each period WITHOUT locked statistics, system calculates dynamic metrics:
   - **Добавлено за неделю** = ALL tasks where `period_id === period.id` (CHANGED from `status !== null`)
   - **Добавлено за неделю (критические)** = tasks where `period_id === period.id AND priority === 'Авария'`
   - **Добавлено за неделю (некритические)** = tasks where `period_id === period.id AND priority !== 'Авария'`
   - **Выполнено за неделю** = tasks where `period_id === period.id AND status === 'Завершена'`
   - **Выполнено за неделю (критические)** = completed tasks with `priority === 'Авария'`
   - **Выполнено за неделю (некритические)** = completed tasks with `priority !== 'Авария'`
   - **В работе** = tasks where `status === 'В работе'` for the period
   - **В тесте** = tasks where `status === 'В тесте'` for the period
   - **В блоке** = tasks where `status === 'Блокер'` for the period
   - **WIP total** = В работе + В тесте (excludes blockers)
4. System calculates cumulative metrics across ALL periods up to and including this one:
   - **Всего проблем** = total count of all tasks in periods <= this period (by start_date order)
   - **Выполнено (cumulative)** = total count of all tasks with `status === 'Завершена'` in periods <= this period
   - **Незавершённые** = Всего проблем - Выполнено (cumulative)
   - **Незавершённые критические** = uncompleted tasks with `priority === 'Авария'`
   - **Незавершённые некритические** = uncompleted tasks with `priority !== 'Авария'`
5. System displays metrics grouped in sections (see UC-5)

**Alternative Scenarios:**
- 3a. Period has no tasks: all dynamic metrics show 0
- 4a. First period in history: cumulative = same as period values

**Postconditions:** User sees corrected and expanded statistics  
**Acceptance Criteria:**
- "Добавлено за неделю" counts ALL tasks for the period regardless of status
- Cumulative "Всего проблем" equals sum of all tasks in periods up to this one
- "Незавершённые" = "Всего проблем" - "Выполнено (cumulative)"
- WIP total = В работе + В тесте (without blockers)

---

### UC-2: Lock Period Metrics with New Fields (Modification)

**Actors:** User, System  
**Preconditions:** Period exists, has no locked statistics yet  

**Main Scenario:**
1. User clicks "Зафиксировать метрики" button
2. System calculates ALL metrics at that moment:
   - Period-specific: added_to_backlog, added_critical, added_non_critical, resolved_total, resolved_critical, resolved_non_critical, in_progress, in_testing, in_block
   - Cumulative: total_problems_cumulative, completed_cumulative, uncompleted, uncompleted_critical, uncompleted_non_critical
   - WIP: wip_total
3. System saves all metrics to `period_statistics` table (comment field defaults to NULL)
4. UI switches to "locked" display mode showing saved values
5. Comment textarea becomes available for the period
6. Timestamp is displayed

**Alternative Scenarios:**
- 2a. Statistics already locked for this period: button is not shown (existing guard)

**Postconditions:** Snapshot saved, metrics no longer update dynamically, comment field becomes available  
**Acceptance Criteria:**
- All new fields are saved to DB when locking
- Locked values don't change when tasks are modified
- UI shows locked indicator with timestamp
- Comment textarea appears after locking

---

### UC-3: Edit Locked Metrics (Modification)

**Actors:** User, System  
**Preconditions:** Period has locked statistics  

**Main Scenario:**
1. User clicks edit (pencil) icon
2. System opens modal with ALL metric fields pre-filled from locked values
3. User modifies desired fields
4. User confirms changes
5. System updates `period_statistics` record

**Alternative Scenarios:**
- 3a. User cancels: no changes saved

**Postconditions:** Updated metrics are persisted  
**Acceptance Criteria:**
- All new metric fields are editable
- Edit modal contains grouped sections matching display layout

---

### UC-4: Add/Edit Comment for Locked Period Statistics (New)

**Actors:** User, System  
**Preconditions:** Period has locked statistics (`period_statistics` record exists)  

**Main Scenario:**
1. System displays textarea in "Comments" section of the period card (only for periods with locked statistics)
2. User types or edits text in textarea
3. System waits for 500-1000ms of inactivity (debounce)
4. System auto-saves comment to existing `period_statistics` record (`comment` field)

**Alternative Scenarios:**
- 1a. Period does NOT have locked statistics: comment textarea is not displayed
- 3a. User keeps typing: debounce timer resets, no save until pause
- 4a. Save fails (network error): show brief error toast, retain text in UI
- 4b. User clears textarea completely: save empty string (or null)

**Postconditions:** Comment persisted in `period_statistics` record  
**Acceptance Criteria:**
- Textarea visible ONLY for periods with locked statistics
- Auto-save triggers after 500-1000ms idle
- No manual save button needed
- Comment persists across page reloads
- Comment is always tied to specific fixed metrics

---

### UC-5: View Metrics in Grouped Layout (New)

**Actors:** User, System  
**Preconditions:** User is on `/stats` page  

**Main Scenario:**
1. System renders each period card with metrics grouped in sections:
   - **Section A: "Добавлено за неделю"** — added_to_backlog (total, critical, non-critical)
   - **Section B: "Выполнено за неделю"** — resolved_total (total, critical, non-critical)
   - **Section C: "В работе (WIP)"** — in_progress, in_testing, wip_total, in_block (marked separately)
   - **Section D: "Накопительные"** — total_problems_cumulative, completed_cumulative, uncompleted (total, critical, non-critical)
   - **Section E: "Комментарий"** — textarea (only displayed when period has locked statistics)
2. Each section has a subtle visual separator or heading
3. Sub-metrics (critical/non-critical) display indented or with smaller font

**Alternative Scenarios:**
- 1a. Locked statistics: display stored values in same grouped layout, comment section visible
- 1b. Unlocked period: comment section is hidden

**Postconditions:** Metrics are visually organized for easy reading  
**Acceptance Criteria:**
- Clear visual separation between sections
- Sub-metrics clearly associated with parent metric
- Responsive layout adapts to screen width
- "В блоке" clearly marked as separate from WIP sum
- Comment section only visible for locked periods

---

### UC-6: Delete Locked Statistics (Existing, unchanged)

Behavior remains the same: delete button removes `period_statistics` record, reverts to dynamic calculation. **Note:** Deleting locked statistics also removes the associated comment (since comment is stored in `period_statistics`).

---

## 3. Database Changes

### Current Schema (`period_statistics`):

```sql
CREATE TABLE period_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL UNIQUE REFERENCES periods(id) ON DELETE CASCADE,
  added_to_backlog INTEGER NOT NULL,
  added_critical INTEGER NOT NULL,
  resolved_total INTEGER NOT NULL,
  resolved_critical INTEGER NOT NULL,
  in_progress INTEGER NOT NULL,
  in_testing INTEGER NOT NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### New Schema (`period_statistics`):

```sql
CREATE TABLE period_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL UNIQUE REFERENCES periods(id) ON DELETE CASCADE,
  
  -- Period-specific: Added
  added_to_backlog INTEGER NOT NULL,
  added_critical INTEGER NOT NULL,
  added_non_critical INTEGER NOT NULL,
  
  -- Period-specific: Resolved
  resolved_total INTEGER NOT NULL,
  resolved_critical INTEGER NOT NULL,
  resolved_non_critical INTEGER NOT NULL,
  
  -- WIP snapshot
  in_progress INTEGER NOT NULL,
  in_testing INTEGER NOT NULL,
  in_block INTEGER NOT NULL DEFAULT 0,
  wip_total INTEGER NOT NULL,
  
  -- Cumulative
  total_problems_cumulative INTEGER NOT NULL,
  completed_cumulative INTEGER NOT NULL,
  uncompleted INTEGER NOT NULL,
  uncompleted_critical INTEGER NOT NULL,
  uncompleted_non_critical INTEGER NOT NULL,
  
  -- Comment
  comment TEXT,
  
  -- Timestamps
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### New Columns Added:
| Column | Type | Description |
|--------|------|-------------|
| `added_non_critical` | INTEGER NOT NULL | Tasks added with priority != 'Авария' |
| `resolved_non_critical` | INTEGER NOT NULL | Completed tasks with priority != 'Авария' |
| `in_block` | INTEGER NOT NULL | Tasks with status 'Блокер' |
| `wip_total` | INTEGER NOT NULL | in_progress + in_testing |
| `total_problems_cumulative` | INTEGER NOT NULL | All tasks ever created up to this period |
| `completed_cumulative` | INTEGER NOT NULL | All completed tasks up to this period |
| `uncompleted` | INTEGER NOT NULL | total_problems_cumulative - completed_cumulative |
| `uncompleted_critical` | INTEGER NOT NULL | Uncompleted tasks with priority 'Авария' |
| `uncompleted_non_critical` | INTEGER NOT NULL | Uncompleted tasks with priority != 'Авария' |
| `comment` | TEXT (nullable) | Free-text comment for the period |

**Note:** Since user wipes DB each time, the migration is a full CREATE TABLE (not ALTER TABLE). The `comment` field is nullable because it starts as NULL when metrics are first locked, and is populated later by the user.

---

## 4. Data Model (TypeScript)

### Updated `PeriodStatistics` type:

```typescript
export type PeriodStatistics = {
  id: string;
  period_id: string;
  
  // Period-specific: Added
  added_to_backlog: number;
  added_critical: number;
  added_non_critical: number;
  
  // Period-specific: Resolved
  resolved_total: number;
  resolved_critical: number;
  resolved_non_critical: number;
  
  // WIP snapshot
  in_progress: number;
  in_testing: number;
  in_block: number;
  wip_total: number;
  
  // Cumulative
  total_problems_cumulative: number;
  completed_cumulative: number;
  uncompleted: number;
  uncompleted_critical: number;
  uncompleted_non_critical: number;
  
  // Comment (only available after metrics are locked)
  comment?: string | null;
  
  // Timestamps
  locked_at: string;
  created_at: string;
};
```

### New type for dynamic metrics calculation:

```typescript
export type DynamicMetrics = {
  // Period-specific
  added_to_backlog: number;
  added_critical: number;
  added_non_critical: number;
  resolved_total: number;
  resolved_critical: number;
  resolved_non_critical: number;
  in_progress: number;
  in_testing: number;
  in_block: number;
  wip_total: number;
  
  // Cumulative
  total_problems_cumulative: number;
  completed_cumulative: number;
  uncompleted: number;
  uncompleted_critical: number;
  uncompleted_non_critical: number;
};
```

---

## 5. Calculation Logic

### Period-Specific Metrics (for a given period):

```
periodTasks = tasks.filter(t => t.period_id === period.id)

added_to_backlog       = periodTasks.length  // FIX: was status !== null
added_critical         = periodTasks.filter(t => t.priority === 'Авария').length
added_non_critical     = periodTasks.filter(t => t.priority !== 'Авария').length

resolved_total         = periodTasks.filter(t => t.status === 'Завершена').length
resolved_critical      = periodTasks.filter(t => t.status === 'Завершена' && t.priority === 'Авария').length
resolved_non_critical  = periodTasks.filter(t => t.status === 'Завершена' && t.priority !== 'Авария').length

in_progress            = periodTasks.filter(t => t.status === 'В работе').length
in_testing             = periodTasks.filter(t => t.status === 'В тесте').length
in_block               = periodTasks.filter(t => t.status === 'Блокер').length
wip_total              = in_progress + in_testing
```

### Cumulative Metrics (across all periods up to this one):

```
// Sort periods by start_date ascending
sortedPeriods = periods.sort((a, b) => a.start_date - b.start_date)
periodsUpToThis = sortedPeriods.filter(p => p.start_date <= period.start_date)
periodIdsUpToThis = periodsUpToThis.map(p => p.id)

allTasksUpToThis = tasks.filter(t => periodIdsUpToThis.includes(t.period_id))

total_problems_cumulative = allTasksUpToThis.length
completed_cumulative      = allTasksUpToThis.filter(t => t.status === 'Завершена').length
uncompleted               = total_problems_cumulative - completed_cumulative
uncompleted_critical      = allTasksUpToThis.filter(t => t.status !== 'Завершена' && t.priority === 'Авария').length
uncompleted_non_critical  = allTasksUpToThis.filter(t => t.status !== 'Завершена' && t.priority !== 'Авария').length
```

### Validation (using provided example data for period 16.01-22.01.2026):

```
total_problems_cumulative = 107 (all tasks across all periods up to this)
completed_cumulative      = 9
uncompleted               = 107 - 9 = 98 ✓
in_progress               = 16
in_testing                = 7
wip_total                 = 16 + 7 = 23 ✓
added_to_backlog          = 18 (added_critical=10, added_non_critical=8)
resolved_total            = 7 (resolved_critical=5, resolved_non_critical=2)
```

---

## 6. UI Changes

### StatsPeriodCard Component — New Layout:

Replace the flat 6-column grid with grouped sections:

```
+------------------------------------------------------------------+
| Period Header (date range)                    [Edit] [Delete]     |
+------------------------------------------------------------------+
|                                                                    |
| -- Добавлено за неделю ------------------------------------       |
| |  Всего: 18    Критические: 10    Некритические: 8        |      |
| ---------------------------------------------------------------   |
|                                                                    |
| -- Выполнено за неделю ------------------------------------       |
| |  Всего: 7     Критические: 5     Некритические: 2        |      |
| ---------------------------------------------------------------   |
|                                                                    |
| -- В работе (WIP) ----------------------------------------       |
| |  В работе: 16    В тесте: 7    WIP итого: 23             |      |
| |  В блоке: 3 (отдельно)                                   |      |
| ---------------------------------------------------------------   |
|                                                                    |
| -- Накопительные ------------------------------------------       |
| |  Всего проблем: 107    Выполнено: 9    Незавершённые: 98  |      |
| |  Незав. крит.: 42    Незав. некрит.: 56                    |      |
| ---------------------------------------------------------------   |
|                                                                    |
| -- Комментарий (only when locked) ------------------------       |
| |  [textarea with auto-save]                                |      |
| ---------------------------------------------------------------   |
|                                                                    |
| Зафиксировано: 22.01.2026 18:00 / [Зафиксировать метрики]        |
+------------------------------------------------------------------+
```

### Comment Section Visibility Rule:
- **Period with locked statistics:** Comment section (Section E) is displayed with a textarea pre-filled with the saved comment value (or empty if null)
- **Period without locked statistics:** Comment section is NOT displayed; no textarea is rendered

### New/Modified Components:

1. **`StatsPeriodCard.tsx`** — restructure to accept new metric props and render sections; conditionally render comment section based on lock state
2. **`StatsMetricGroup.tsx`** (new) — renders a section with title and child metrics
3. **`StatsMetricItem.tsx`** — keep as-is, possibly add variant for sub-metrics (smaller)
4. **`StatsComment.tsx`** (new) — textarea with debounced auto-save; receives `periodStatisticsId` and initial `comment` value as props; only rendered when `period_statistics` record exists
5. **`EditMetricsModal.tsx`** — expand form to include all new fields, grouped in sections
6. **`LockMetricsButton.tsx`** — update to calculate and save all new metrics

---

## 7. State Management (Jotai)

### Changes to `statsAtom.ts`:

1. **`lockPeriodMetricsAtom`** — update calculation logic:
   - Fix `added_to_backlog` to count ALL period tasks
   - Add all new metric calculations
   - Add cumulative calculations (requires access to `periodsAtom`)

2. **`updatePeriodStatisticsAtom`** — update `MetricsPayload` type to include new fields

3. **New atom: `updatePeriodCommentAtom`** — handles comment save:
   - Takes `{ periodId: string, comment: string }`
   - Updates only the `comment` field in the existing `period_statistics` record
   - **Precondition:** `period_statistics` record must already exist (metrics must be locked)
   - No upsert needed — comment can only be edited when statistics are locked

### MetricsPayload Update:

```typescript
type MetricsPayload = Pick<
  PeriodStatistics,
  | 'added_to_backlog' | 'added_critical' | 'added_non_critical'
  | 'resolved_total' | 'resolved_critical' | 'resolved_non_critical'
  | 'in_progress' | 'in_testing' | 'in_block' | 'wip_total'
  | 'total_problems_cumulative' | 'completed_cumulative'
  | 'uncompleted' | 'uncompleted_critical' | 'uncompleted_non_critical'
>;
```

### Dynamic Metrics Calculation:

Move calculation from `page.tsx` into a reusable utility function:

```typescript
function calculateDynamicMetrics(
  period: Period,
  allPeriods: Period[],
  allTasks: Task[]
): DynamicMetrics { ... }
```

---

## 8. Validation Rules & Constraints

### Data Integrity:
- `added_to_backlog = added_critical + added_non_critical` (tasks with null priority counted as non-critical)
- `resolved_total = resolved_critical + resolved_non_critical`
- `wip_total = in_progress + in_testing` (always, no exceptions)
- `uncompleted = total_problems_cumulative - completed_cumulative`
- `uncompleted_critical + uncompleted_non_critical = uncompleted`

### Comment Rules:
- Comment can ONLY be edited when a `period_statistics` record exists (i.e., metrics are locked)
- Comment field is nullable (`TEXT` / `string | null`)
- Comment is saved via debounced auto-save to the existing `period_statistics` record
- Deleting locked statistics also deletes the comment (cascade behavior via record deletion)

### Edge Cases:
1. **Period with 0 tasks**: all metrics = 0
2. **Tasks with null priority**: counted as "non-critical" (priority !== 'Авария' is true when null)
3. **Tasks that move between periods**: a task's `period_id` determines which period it belongs to
4. **Cumulative with only one period**: cumulative = period values
5. **Comment on unlocked period**: not possible — textarea is not rendered until metrics are locked
6. **Lock then delete then re-lock**: previous comment is lost; new lock creates fresh record with `comment = NULL`

### Debounce Rules (Comment):
- Debounce interval: 700ms (recommended middle ground)
- On unmount/navigation: flush pending save immediately
- On error: show toast, do NOT clear textarea content

---

## 9. Testing Considerations

Key scenarios to verify (no test implementation needed):

1. **"Добавлено" fix**: create tasks with null status -> verify they're counted in `added_to_backlog`
2. **Cumulative across periods**: create 3 periods with tasks -> verify cumulative totals accumulate correctly
3. **WIP excludes blockers**: tasks with status 'Блокер' don't add to wip_total
4. **Lock captures all fields**: lock metrics -> verify all 15+ fields saved correctly
5. **Edit modal fields**: open edit -> verify all new fields are present and editable
6. **Comment auto-save**: lock metrics -> type comment -> wait debounce -> reload page -> verify comment persisted
7. **Comment not available before lock**: verify no textarea for unlocked periods
8. **Comment deleted on unlock**: delete locked stats -> verify comment is gone when re-locking
9. **Example data validation**: reproduce the 16.01-22.01.2026 example and verify all numbers match

---

## 10. Acceptance Criteria

- [ ] "Добавлено в бэклог" counts ALL tasks for the period (`periodTasks.length`), not just those taken into work
- [ ] New cumulative metrics (Всего проблем, Выполнено, Незавершённые) calculated correctly across periods
- [ ] Cumulative breakdown: Незавершённые = Критические + Некритические
- [ ] WIP section shows В работе, В тесте, WIP total; В блоке displayed separately
- [ ] WIP total = В работе + В тесте (blockers excluded)
- [ ] Period metrics: Выполнено за неделю with critical/non-critical split
- [ ] Period metrics: Добавлено за неделю with critical/non-critical split
- [ ] Comment textarea present ONLY for periods with locked statistics
- [ ] Comment auto-saves with debounce (500-1000ms)
- [ ] Comment persists across page reloads
- [ ] Comment not available for unlocked periods (no textarea rendered)
- [ ] Metrics grouped into logical sections with visual separation
- [ ] Lock captures ALL new metrics in snapshot
- [ ] Edit modal allows editing ALL new metrics
- [ ] Database migration includes all new columns (including `comment TEXT` in `period_statistics`)
- [ ] Example data (period 16.01-22.01.2026) reproduces correctly
- [ ] Responsive layout maintained
- [ ] Deleting locked statistics removes the comment

---

## 11. Constraints and Assumptions

### Assumptions:
1. **Priority null handling**: Tasks with `priority = null` are treated as non-critical (priority !== 'Авария' is true when null). This means `added_critical + added_non_critical = added_to_backlog` always holds.
2. **Period ordering for cumulative**: Periods are ordered by `start_date` ascending. A period's cumulative metrics include all periods with `start_date <= this.start_date`.
3. **Comment requires locked metrics**: The comment field is stored in `period_statistics` and is only available after metrics are locked. This simplifies the logic — no need to create a statistics record before locking.
4. **DB wipe workflow**: Since user wipes DB each time, migration is a full schema (not ALTER TABLE).
5. **"Non-critical" definition**: Any priority that is NOT 'Авария' — includes 'Нормальный', 'Некритичный', and null.

### Technical Constraints:
- All calculations happen client-side (Jotai atoms), not server-side
- Supabase is used as a simple PostgreSQL store (no RPC/functions)
- No server components for data fetching (current pattern: client-side fetch in atoms)

---

## 12. Open Questions

1. ~~**Comment storage for unlocked periods**~~ — **RESOLVED**: Comment field goes to `period_statistics` table. Comment is available ONLY after metrics are locked. Simpler logic: no need to create statistics record before locking. Comment is always tied to specific fixed metrics.

2. **Priority null in non-critical**: Should tasks with `priority = null` be counted as "Некритические"? The current filter `priority !== 'Авария'` will return true for null. **Assumption made**: yes, null = non-critical.

---

## 13. Anticipated Architecture Questions

1. **Calculation placement**: Should cumulative metrics be calculated in the page component, in a derived atom, or in a utility function? (Recommend: utility function called from page, passed as props)
2. **Comment save endpoint**: Should it use the existing `updatePeriodStatistics` DAL function (updating only the `comment` field) or a dedicated function? Since comment is in `period_statistics`, the existing update function can be extended with an optional `comment` parameter.
3. **Edit modal complexity**: With 15+ fields, should the edit modal use sections/tabs, or remain a single scrollable form?
