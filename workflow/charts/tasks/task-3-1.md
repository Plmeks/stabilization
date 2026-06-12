# Task 3-1: Create ChartsSection Container Component

## Description
Create `src/components/stats/charts/ChartsSection.tsx` — a client component that reads `periodsAtom`, `tasksAtom`, and `periodStatisticsAtom` from Jotai, calls `calculateChartData()` with `useMemo`, and renders all three charts: `CFDChart` and two `BacklogChart` instances.

## Changes Required

### New Files
- `src/components/stats/charts/ChartsSection.tsx` — container component

### Modified Files
- none

## Implementation Details

### Component: `ChartsSection`

**File directive:** `'use client'` at the top.

**No props** — the component reads all data from Jotai atoms internally.

**Atom reads (use `useAtomValue`):**
- `periodsAtom` from `'@/atoms/periodsAtom'`
- `tasksAtom` from `'@/atoms/tasksAtom'`
- `periodStatisticsAtom` from `'@/atoms/statsAtom'`

**Data calculation:**
- Use `useMemo` to call `calculateChartData(periods, tasks, periodStatistics)`.
- Dependency array: `[periods, tasks, periodStatistics]`.
- Import `calculateChartData` from `'@/lib/chart-utils'`.

**Early return — no data:**
- If `periods.length === 0`, return `null`. This matches the existing page behavior of showing nothing when there is no data.

**Layout structure:**
- Outer `<div>` with Tailwind: `space-y-6 mb-6`
- Inside: a section header `<h2>` or `<p>` with text `"Графики"` and classes `text-base font-semibold text-foreground` (optional, may be omitted if the charts' own titles are sufficient — use your judgment)
- Render `<CFDChart data={chartData} />`
- Render `<BacklogChart data={chartData} dataKey="uncompleted_critical" color="#f87171" title="Кумулятивный остаток критичных тикетов" />`
- Render `<BacklogChart data={chartData} dataKey="uncompleted_non_critical" color="#fb923c" title="Кумулятивный остаток некритичных тикетов" />`

**Reactivity:**
- Since the component reads Jotai atoms via `useAtomValue`, it automatically re-renders whenever `periodsAtom`, `tasksAtom`, or `periodStatisticsAtom` change (e.g. after task completion, period creation, metric locking/deletion). No extra wiring needed.

**Imports summary:**
```
'use client'
import * as React from 'react'
import { useAtomValue } from 'jotai'
import { periodsAtom } from '@/atoms/periodsAtom'
import { tasksAtom } from '@/atoms/tasksAtom'
import { periodStatisticsAtom } from '@/atoms/statsAtom'
import { calculateChartData } from '@/lib/chart-utils'
import CFDChart from './CFDChart'
import BacklogChart from './BacklogChart'
```

## Dependencies
- Depends on: task-2-1 (CFDChart), task-2-2 (BacklogChart)

## Acceptance Criteria
- [ ] Component created with `'use client'` directive
- [ ] Reads all three Jotai atoms (`periodsAtom`, `tasksAtom`, `periodStatisticsAtom`)
- [ ] Chart data memoized with `useMemo` depending on all three atoms
- [ ] Returns `null` when `periods.length === 0`
- [ ] Renders `CFDChart` with `chartData`
- [ ] Renders two `BacklogChart` instances with correct `dataKey`, `color`, and `title`
- [ ] No TypeScript errors

## Complexity
Medium
