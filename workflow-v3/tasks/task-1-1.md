# Task 1.1: Database Schema + TypeScript Types

## Related Use Cases
- UC-1: View Dynamic Statistics with Corrected "Добавлено" Logic
- UC-2: Lock Period Metrics with New Fields
- UC-3: Edit Locked Metrics
- UC-4: Add/Edit Comment for Locked Period Statistics
- UC-5: View Metrics in Grouped Layout

## Task Goal
Rewrite the database migration to add 9 new metric columns and a `comment` field to the `period_statistics` table, and update the `PeriodStatistics` TypeScript type to reflect the new schema. This is the foundation that all other tasks build on.

## Description of Changes

### Changes to Existing Files

#### File: `supabase/migrations/001_create_tables.sql`

Fully replace the existing `CREATE TABLE period_statistics` statement with the new schema below. Keep the `periods` and `tasks` tables unchanged. Keep all existing indexes unchanged.

**New `period_statistics` DDL (replace the old one entirely):**

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

#### File: `src/types/index.ts`

Replace the existing `PeriodStatistics` type with the expanded version that includes all new fields:

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

  // Comment
  comment: string | null;

  // Timestamps
  locked_at: string;
  created_at: string;
};
```

All other types in `src/types/index.ts` (`Period`, `Task`, `CreatePeriodInput`, etc.) remain unchanged.

## Acceptance Criteria
- [ ] Migration file contains the full new `period_statistics` schema with all 16+ columns
- [ ] `PeriodStatistics` TypeScript type has all new fields with correct types
- [ ] `comment` is typed as `string | null` (nullable)
- [ ] All existing columns are preserved (`id`, `period_id`, `added_to_backlog`, `added_critical`, `resolved_total`, `resolved_critical`, `in_progress`, `in_testing`, `locked_at`, `created_at`)
- [ ] TypeScript compiler finds zero errors in `src/types/index.ts` after change

## Notes
- The user wipes the database each time before applying migrations, so this is a full schema file, not an ALTER TABLE migration.
- After this task, downstream files (`dal.ts`, `statsAtom.ts`, etc.) will show TypeScript errors because their `MetricsPayload` types reference only the old 6 fields — those are fixed in tasks 1.2, 2.1, and 3.3.
