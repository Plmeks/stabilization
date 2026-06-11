# Task 2.1: Root Layout & Tab Navigation

## Related Use Cases
- UC-10: Tab Navigation

## Goal
Build the root layout with tab navigation bar and wire up the four routes.

## Changes

### Modified Files

#### `src/app/layout.tsx`
- Wrap `{children}` with Jotai `Provider`
- Include `TabNavigation` at the top
- Include a `DataLoader` client component that calls `fetchPeriodsAtom` and `fetchTasksAtom` on mount (useEffect)
- Apply base Tailwind classes: `min-h-screen bg-background text-foreground`

### New Files

#### `src/components/layout/TabNavigation.tsx`
- Client component (`'use client'`)
- Uses `usePathname()` from `next/navigation` to determine active tab
- Renders 4 tab buttons: "Новые задачи / QA" (`/qa`), "Текущие задачи" (`/current`), "Выполненные" (`/completed`), "Статистика" (`/stats`)
- Active tab styled with `bg-primary text-primary-foreground`, inactive with `hover:bg-muted`
- Uses `<Link>` from `next/link` for navigation (no full reload)
- Responsive: on mobile, wraps or scrolls horizontally

#### `src/components/layout/DataLoader.tsx`
- Client component (`'use client'`)
- `useEffect(() => { /* call fetchPeriodsAtom and fetchTasksAtom */ }, [])`
- After fetching periods, calls `initExpandedPeriodsAtom` with the result
- Returns `null` (no rendered output)

#### `src/app/qa/page.tsx` — empty placeholder: `export default function QAPage() { return <div>QA</div> }`
#### `src/app/current/page.tsx` — placeholder
#### `src/app/completed/page.tsx` — placeholder
#### `src/app/stats/page.tsx` — placeholder

## Notes
- URL updates automatically because tabs are `<Link>` elements
- Server Components for pages; client components for interactive parts
- `DataLoader` is a client component nested inside the server root layout
