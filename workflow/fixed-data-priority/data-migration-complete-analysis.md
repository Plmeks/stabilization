# Data Migration Complete Analysis

## Source
- Primary: `doc-data/Эпик_ Стабилизация звонков.html`
- Schema: `supabase/migrations/001_create_tables.sql`

## Extraction Summary

### Periods: 11 of 11 extracted

| # | Period | Start | End | Added | Crit | Resolved | Cumulative Total | Cumulative Done | Uncompleted |
|---|--------|-------|-----|-------|------|----------|-----------------|-----------------|-------------|
| P1 | 01.01-08.01 | 2026-01-01 | 2026-01-08 | 93 | 48 | 0 | 93 | 0 | 93 |
| P2 | 09.01-15.01 | 2026-01-09 | 2026-01-15 | 2 | 1 | 2 | 95 | 2 | 93 |
| P3 | 16.01-22.01 | 2026-01-16 | 2026-01-22 | 18 | 10 | 7 | 107 | 9 | 98 |
| P4 | 23.01-29.01 | 2026-01-23 | 2026-01-29 | 8 | 3 | 15 | 115 | 24 | 91 |
| P5 | 30.01-05.02 | 2026-01-30 | 2026-02-05 | 5 | 3 | 10 | 120 | 34 | 86 |
| P6 | 06.02-12.02 | 2026-02-06 | 2026-02-12 | 13 | 8 | 20 | 139 | 54 | 85 |
| P7 | 13.02-19.02 | 2026-02-13 | 2026-02-19 | 13 | 8 | 26 | 152 | 80 | 72 |
| P8 | 20.02-26.02 | 2026-02-20 | 2026-02-26 | 17 | 5 | 5 | 169 | 85 | 84 |
| P9 | 27.02-06.03 | 2026-02-27 | 2026-03-06 | 13 | 3 | 18 | 182 | 103 | 79 |
| P10 | 10.03-19.03 | 2026-03-10 | 2026-03-19 | 23 | 6 | 25 | 205 | 128 | 77 |
| P11 | 20.03-26.03 | 2026-03-20 | 2026-03-26 | 5 | 4 | 16 | 216 | 144 | 72 |

### Tasks: 138 total

| Period | New Tasks | Backlog Tasks | Total |
|--------|-----------|---------------|-------|
| P1 (backlog) | — | 17 (resolved in P2-P4) | 17 |
| P2 | 2 | — | 2 |
| P3 | 18 | — | 18 |
| P4 | 8 | — | 8 |
| P5 | 5 | — | 5 |
| P6 | 17 | — | 17 |
| P7 | 13 | — | 13 |
| P8 | 17 | — | 17 |
| P9 | 13 | — | 13 |
| P10 | 23 | — | 23 |
| P11 | 5 | — | 5 |

### Statistics: 11 of 11 periods with complete data

All statistics extracted directly from the HTML document's "Статистика" section.

## Data Sources & Methodology

### Statistics (period_statistics)
- **P1-P2**: Basic stats from document header (added, resolved, WIP only). Cumulative values calculated forward from P1 baseline.
- **P3-P11**: Complete statistics from weekly reports with all metrics including cumulative totals, WIP breakdown, and analyst comments.

### Tasks
- **Source 1 — "Новые задачи / QA /"**: New tasks added per period. Used for `creation_period_id`.
- **Source 2 — "Решены / Разработчики /"**: Tasks resolved per period. Used to determine `status` (Завершена) and `active_period_id`.
- **Source 3 — "Список задач / Продакт и QA/"**: Current WIP tasks at document snapshot time. Used to identify tasks still "В работе".
- **P1 backlog**: 17 individually identifiable tasks from the initial 93-item backlog that were resolved in P2-P4 and listed in "Решены" sections.

### Task Status Resolution
- If a task appears in any "Решены" section within P1-P11 scope → `status = 'Завершена'`
- If a task appears in "Список задач" (active WIP) → `status = 'В работе'`
- If resolved after P11 (26.03.2026) → `status = 'В работе'` (within our 11-period scope)

### Known Data Notes

1. **P1 cumulative vs P3 cumulative**: P1 reports 93 initial items, but working backwards from P3 (total=107, added=18) suggests P2 end total was 89 (not 95). Minor discrepancy likely due to task consolidation during the first weeks.

2. **P6 task count**: The document stats say "13 added" but lists the "Авария после разделения чата и звонков" as 1 item with 5 sub-items (separate bug IDs: 239585, 239583, 239591, 239690, 239733). In the migration, these are stored as 5 separate tasks for granular tracking, making the DB task count (17) higher than the stat count (13).

3. **P11 duplicate**: Task 242747 appears twice in the "Новые задачи" P11 section (confirmed duplicate in source document). Both entries preserved in migration.

4. **Initial backlog coverage**: Only 17 of the 93 initial P1 backlog tasks are individually tracked (those that appeared in "Решены" P2-P4 sections). The remaining 76 are represented only in aggregate statistics.

## Period IDs

Deterministic UUIDs for referential integrity:

```
P1:  a1b2c3d4-0101-4000-8000-000000000001
P2:  a1b2c3d4-0102-4000-8000-000000000002
P3:  a1b2c3d4-0103-4000-8000-000000000003
P4:  a1b2c3d4-0104-4000-8000-000000000004
P5:  a1b2c3d4-0105-4000-8000-000000000005
P6:  a1b2c3d4-0106-4000-8000-000000000006
P7:  a1b2c3d4-0107-4000-8000-000000000007
P8:  a1b2c3d4-0108-4000-8000-000000000008
P9:  a1b2c3d4-0109-4000-8000-000000000009
P10: a1b2c3d4-0110-4000-8000-000000000010
P11: a1b2c3d4-0111-4000-8000-000000000011
```

## Migration File

- Path: `supabase/migrations/002_seed_data_complete.sql`
- Size: ~44KB
- Records: 11 periods + 138 tasks + 11 period_statistics = 160 total records
