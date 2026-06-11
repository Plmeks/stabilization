# Stability

A task management application for tracking work periods and tasks, built with Next.js, Supabase, and deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **State**: Jotai
- **Language**: TypeScript

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A Supabase project (see [Supabase Setup](#supabase-setup) below)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stability.git
cd stability
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

See [Supabase Setup](#supabase-setup) for how to get these values.

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase Setup

### Step 1 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project**.
3. Fill in:
   - **Name**: e.g. `stability`
   - **Database Password**: choose a strong password and save it
   - **Region**: pick the one closest to your users
4. Click **Create new project** and wait ~1 minute for provisioning.

### Step 2 — Run the Migration

1. In the Supabase Dashboard, open your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and paste it into the editor.
5. Click **Run** (▶).
6. Verify by going to **Table Editor** — you should see `periods` and `tasks` tables.

The migration creates:
- `periods` table — work periods with date range and metrics snapshot
- `tasks` table — tasks linked to periods with status, priority, and assignee fields

### Step 3 — Copy API Keys into `.env.local`

1. In the Supabase Dashboard, go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** (e.g. `https://xxxxxxxxxxxx.supabase.co`).
3. Copy the **anon public** key (under "Project API keys").
4. Paste both values into `.env.local`.

### Step 4 — Disable Row Level Security (RLS)

This application does not use authentication in v1, so RLS must be disabled on both tables.

Run the following SQL in the **SQL Editor**:

```sql
ALTER TABLE periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

Alternatively: go to **Table Editor** → click each table → click the **RLS** button → **Disable RLS**.

---

## Vercel Deployment

### Step 1 — Push to GitHub

Create a new GitHub repository and push your code:

```bash
git remote add origin https://github.com/your-username/stability.git
git push -u origin main
```

### Step 2 — Import into Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Click **Import** next to your GitHub repository.
4. Vercel auto-detects Next.js — no framework configuration needed.
5. Click **Deploy**.

### Step 3 — Add Environment Variables

Before or after the first deploy, go to your Vercel project:

**Project Settings → Environment Variables**

Add the following variables for **Production**, **Preview**, and **Development** environments:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |

After adding variables, redeploy the project for them to take effect:
**Deployments → click the latest deployment → Redeploy**.

### Step 4 — Configure CORS in Supabase

Allow your Vercel deployment URL to make requests to Supabase:

1. In the Supabase Dashboard, go to **Project Settings** → **API**.
2. Under **Allowed Origins**, add your Vercel production URL:
   ```
   https://your-app.vercel.app
   ```
3. If you use custom domains, add those as well.
4. Click **Save**.

### Step 5 — Verify the Deployment

Open your Vercel deployment URL and confirm:
- The app loads without errors
- All tabs and views work correctly
- Tasks can be created, updated, and deleted

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (e.g. `https://xxxxxxxxxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key (JWT) |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are embedded into the client-side bundle at build time. Never put secret keys in `NEXT_PUBLIC_` variables.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server at http://localhost:3000 |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## Project Structure

```
stability/
├── src/
│   └── app/              # Next.js App Router pages and layouts
├── supabase/
│   └── migrations/       # SQL migration files
├── public/               # Static assets
├── .env.example          # Example environment variables
└── .env.local            # Local environment variables (not committed)
```
