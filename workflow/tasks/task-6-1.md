# Task 6.1: Vercel Deployment Configuration

## Related Use Cases
- All use cases

## Goal
Configure and deploy the application to Vercel with proper environment variables.

## Changes

### New Files
- `vercel.json` — minimal config (usually not needed for Next.js on Vercel, but add if custom headers/redirects are required)
- `.env.example` — already created in task-1-1; verify it contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deployment Steps
1. Push code to GitHub (create a new repository)
2. Connect the repository to Vercel (vercel.com → New Project → Import Git Repository)
3. In Vercel project settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Deploy — Vercel auto-detects Next.js and builds correctly
5. Verify the deployment URL works and all tabs load

### Supabase CORS Setup
- In Supabase Dashboard → Settings → API → Allowed Origins: add your Vercel production URL (e.g. `https://your-app.vercel.app`)

## Notes
- No custom `vercel.json` needed for standard Next.js App Router deployments
- Environment variables with `NEXT_PUBLIC_` prefix are embedded at build time
- Enable automatic deployments on push to `main` branch in Vercel
