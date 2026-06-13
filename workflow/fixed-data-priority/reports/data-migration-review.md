# Data Migration SQL Review (`002_seed_data.sql`)

## Overall Assessment
⚠️ Changes required

## Checklist Validation

### 1) SQL Syntax
- ✅ Valid PostgreSQL syntax (multi-row `INSERT`, casts to `timestamptz`, valid statement termination).
- ✅ UUID usage is valid: fixed UUID literals for `periods.id` are well-formed; row IDs use `gen_random_uuid()`.
- ✅ Correct table names are used: `periods`, `tasks`, `period_statistics`.
- ✅ Required columns are present in all `INSERT` statements and align with `001_create_tables.sql`.

### 2) Data Integrity
- ✅ Period dates use `YYYY-MM-DD` format (`2026-01-16`, `2026-01-22`, `2026-01-23`, `2026-01-29`).
- ✅ Task priorities are valid schema values (`Критический`, `Нормальный`).
- ✅ Task statuses are valid schema values (`В работе`, `Завершена`).
- ✅ Period references point to the two inserted period IDs.
- 🔴 **Blocking issue found:** one task is inserted with `link = NULL`, which violates the stated requirement of 26 tasks with Jira links.
  - File: `supabase/migrations/002_seed_data.sql`
  - Problem row: task `"Бек: callcontroller: 0235776: ОБЛАЧКА ..."` has `NULL` link.
  - Required fix: provide the corresponding Jira link (or explicitly update requirement/spec to allow missing links).

### 3) Statistics Accuracy vs Fixed Data
- ✅ Period 1 values match exactly:  
  `18,10,7,5,16,7,0,23,107,9,98,47,51`
- ✅ Period 2 values match exactly:  
  `8,3,15,10,10,8,8,18,115,24,91,40,51`
- ✅ Derived fields in SQL are consistent with supplied fixed data (`added_non_critical`, `resolved_non_critical`).

### 4) Task Count Verification
- ✅ Period 1 has 18 tasks in the first `tasks` insert block.
- ✅ Period 2 has 8 tasks in the second `tasks` insert block.
- ✅ Total tasks inserted: 26.

### 5) Data Cleanup
- ✅ Cleanup statements are present.
- ✅ Delete order is correct for FK safety: `period_statistics` → `tasks` → `periods`.

## Final Decision
⚠️ **CHANGES REQUIRED**

Rationale: Migration structure, schema compatibility, counts, and statistics are correct, but one task link is `NULL` despite the stated requirement that all 26 tasks include Jira links. The migration is not fully compliant until this is resolved.
