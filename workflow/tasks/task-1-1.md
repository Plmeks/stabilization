# Task 1.1: Next.js Project Initialization

## Related Use Cases
- UC-10: Tab Navigation

## Goal
Bootstrap the Next.js application with all required dependencies and base configuration.

## Changes

### New Files
- `package.json` — dependencies and scripts
- `next.config.ts` — Next.js config
- `tsconfig.json` — TypeScript config
- `tailwind.config.ts` — Tailwind with shadcn/ui theme tokens
- `postcss.config.mjs`
- `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (template with empty values)
- `.env.example` — same keys, safe to commit
- `components.json` — shadcn/ui config
- `src/app/globals.css` — Tailwind base + CSS variables for shadcn/ui
- `src/app/layout.tsx` — root HTML shell (no UI yet, just `<html><body>{children}</body>`)
- `src/app/page.tsx` — redirect to `/qa` via `next/navigation` `redirect()`

## Key Dependencies to Install
- `next` (latest)
- `react`, `react-dom`
- `typescript`, `@types/react`, `@types/node`
- `tailwindcss`, `postcss`, `autoprefixer`
- `shadcn/ui` (via `npx shadcn@latest init`)
- `jotai`
- `dayjs`
- `@supabase/supabase-js`

## shadcn/ui Components to Install
Run `npx shadcn@latest add` for: `button`, `dialog`, `input`, `select`, `label`, `badge`, `table`, `popover`, `calendar`, `separator`

## Notes
- Use `src/` directory layout
- App Router (`src/app/`)
- shadcn/ui `New York` style, `neutral` base color, CSS variables enabled
- Add `.cursor/` and `node_modules/` to `.gitignore`
