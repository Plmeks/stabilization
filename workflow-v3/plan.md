# Development Plan: Expanded Statistics System with Cumulative Metrics

## Overview

### Summary
Expand the `/stats` page to support ~15 metrics organized in logical sections, fix the `added_to_backlog` bug (should count ALL tasks, not just those taken into work), add cumulative cross-period calculations, introduce a per-period comment field (available only after metrics are locked), and restructure the UI into grouped metric sections.

### Objectives
1. Fix bug: `added_to_backlog` counts ALL tasks for a period regardless of status
2. Add 9 new metric fields to `period_statistics` table and all associated layers
3. Add `comment TEXT` field to `period_statistics`, editable via debounced auto-save only when metrics are locked
4. Restructure `StatsPeriodCard` into 5 logical sections (Added, Resolved, WIP, Cumulative, Comment)
5. Expand `EditMetricsModal` to cover all new fields

### Affected Files
| File | Change Type |
|------|-------------|
| `supabase/migrations/001_create_tables.sql` | Full rewrite |
| `src/types/index.ts` | Update `PeriodStatistics` type |
| `src/lib/supabase/dal.ts` | Update signatures, add comment update function |
| `src/lib/stats-utils.ts` | **NEW** — `calculateDynamicMetrics()` utility |
| `src/atoms/statsAtom.ts` | Update atoms, fix bug, add comment atom |
| `src/app/stats/page.tsx` | Use utility, pass new props |
| `src/components/stats/StatsPeriodCard.tsx` | Full restructure |
| `src/components/stats/StatsMetricItem.tsx` | Add sub-metric variant |
| `src/components/stats/StatsMetricGroup.tsx` | **NEW** — section container |
| `src/components/stats/StatsComment.tsx` | **NEW** — debounced comment textarea |
| `src/components/modals/EditMetricsModal.tsx` | Expand to all new fields |

---

## Task Execution Sequence

### Phase 1: Data Foundation

- **Task 1.1** — Database Schema + TypeScript Types
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5
  - Description file: `tasks/task-1-1.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes

- **Task 1.2** — DAL Updates
  - Use Cases: UC-2, UC-3, UC-4
  - Description file: `tasks/task-1-2.md`
  - Priority: Critical
  - Dependencies: task-1-1
  - Parallelizable: yes (different file from 1.1)

### Phase 2: Logic Layer

- **Task 2.1** — Stats Calculation Utility + Atom Updates
  - Use Cases: UC-1, UC-2, UC-4
  - Description file: `tasks/task-2-1.md`
  - Priority: Critical
  - Dependencies: task-1-1, task-1-2
  - Parallelizable: yes (new file + separate atom file)

### Phase 3: UI Layer

- **Task 3.1** — New UI Components (StatsMetricGroup + StatsComment) + StatsMetricItem update
  - Use Cases: UC-4, UC-5
  - Description file: `tasks/task-3-1.md`
  - Priority: High
  - Dependencies: task-2-1
  - Parallelizable: yes (new files)

- **Task 3.2** — StatsPeriodCard Restructure
  - Use Cases: UC-1, UC-2, UC-5
  - Description file: `tasks/task-3-2.md`
  - Priority: High
  - Dependencies: task-3-1
  - Parallelizable: no (depends on task-3-1 components)

- **Task 3.3** — EditMetricsModal Expansion
  - Use Cases: UC-3
  - Description file: `tasks/task-3-3.md`
  - Priority: High
  - Dependencies: task-2-1
  - Parallelizable: yes (different file; can run alongside task-3-1 and task-3-2)

- **Task 3.4** — Stats Page Integration
  - Use Cases: UC-1, UC-5
  - Description file: `tasks/task-3-4.md`
  - Priority: High
  - Dependencies: task-3-2
  - Parallelizable: no (consumes updated StatsPeriodCard interface)

---

## Use Case Coverage Matrix

| Use Case | Tasks |
|----------|-------|
| UC-1: View Dynamic Statistics (corrected "Добавлено" logic) | 1-1, 1-2, 2-1, 3-2, 3-4 |
| UC-2: Lock Period Metrics with New Fields | 1-1, 1-2, 2-1, 3-2 |
| UC-3: Edit Locked Metrics | 1-1, 1-2, 3-3 |
| UC-4: Add/Edit Comment for Locked Period Statistics | 1-1, 1-2, 2-1, 3-1, 3-2 |
| UC-5: View Metrics in Grouped Layout | 1-1, 3-1, 3-2, 3-4 |
| UC-6: Delete Locked Statistics (unchanged) | — (no changes needed) |
