# Task 1.2 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `supabase/migrations/001_initial_schema.sql` — DDL for `periods` and `tasks` tables with indexes and constraints

### Modified files:
None (`.env.local` already has the correct placeholder keys from task 1.1)

---

## USER ACTION REQUIRED: Supabase Setup Guide

Follow these steps to create the Supabase project and apply the migration.

### Step 1 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project**.
3. Fill in:
   - **Name**: e.g. `stability`
   - **Database Password**: choose a strong password (save it somewhere safe)
   - **Region**: pick the one closest to you
4. Click **Create new project** and wait ~1 minute for provisioning.

---

### Step 2 — Run the Migration

1. In the Supabase Dashboard, open your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and paste it into the editor.
5. Click **Run** (▶).
6. You should see a success message. Verify by going to **Table Editor** — you should see `periods` and `tasks` tables.

---

### Step 3 — Copy API Keys into `.env.local`

1. In the Supabase Dashboard, go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`).
3. Copy the **anon public** key (a long JWT string under "Project API keys").
4. Open `.env.local` in the project root and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 4 — Disable Row Level Security (RLS)

Since v1 has no authentication, RLS must be disabled on both tables.

1. In the Supabase Dashboard, go to **Table Editor**.
2. Click on the `periods` table → click the **RLS** button at the top → click **Disable RLS**.
3. Repeat for the `tasks` table.

Alternatively, run the following SQL in the **SQL Editor**:

```sql
ALTER TABLE periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

---

## Notes
- `ON DELETE CASCADE` on `tasks.period_id` handles UC-9 (delete period → deletes all tasks) automatically at the database level.
- `metrics_snapshot` is a JSONB column; expected shape: `{"in_progress": number, "in_testing": number}`.
- Five indexes are created on `tasks` to support filtering/sorting by status, priority, and timestamp columns.
