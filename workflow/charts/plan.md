# Development Plan: Charts Feature for Statistics Tab

## Overview

Add three Recharts-based analytical charts to the Statistics tab (`/src/app/stats/page.tsx`):
1. **CFD с линией WIP** — ComposedChart with stacked areas + WIP overlay line
2. **Кумулятивный остаток критичных тикетов** — Line chart (red/coral)
3. **Кумулятивный остаток некритичных тикетов** — Line chart (orange)

All data comes from existing Jotai atoms (`periodsAtom`, `tasksAtom`, `periodStatisticsAtom`). No DB schema changes.

---

## Task Execution Sequence

### Wave 1: Foundation (parallelizable)

- **Task 1-1** — Install Recharts dependency
  - Use Cases: UC-1, UC-2, UC-3
  - Description file: `tasks/task-1-1.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes (no file modifications, only pnpm install)
  - Complexity: Simple

- **Task 1-2** — Create chart data calculation utilities (`src/lib/chart-utils.ts`)
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5
  - Description file: `tasks/task-1-2.md`
  - Priority: Critical
  - Dependencies: none
  - Parallelizable: yes (creates a new file)
  - Complexity: Medium

### Wave 2: Chart Components (parallelizable, depend on Wave 1)

- **Task 2-1** — Create CFD chart component (`src/components/stats/charts/CFDChart.tsx`)
  - Use Cases: UC-1
  - Description file: `tasks/task-2-1.md`
  - Priority: High
  - Dependencies: task-1-1, task-1-2
  - Parallelizable: yes (new file, no shared files with task-2-2)
  - Complexity: Medium

- **Task 2-2** — Create BacklogChart reusable component (`src/components/stats/charts/BacklogChart.tsx`)
  - Use Cases: UC-2, UC-3
  - Description file: `tasks/task-2-2.md`
  - Priority: High
  - Dependencies: task-1-1, task-1-2
  - Parallelizable: yes (new file, no shared files with task-2-1)
  - Complexity: Simple

### Wave 3: Container Component (depends on Wave 2)

- **Task 3-1** — Create ChartsSection container (`src/components/stats/charts/ChartsSection.tsx`)
  - Use Cases: UC-1, UC-2, UC-3, UC-4, UC-5
  - Description file: `tasks/task-3-1.md`
  - Priority: High
  - Dependencies: task-2-1, task-2-2
  - Parallelizable: no (single task in this wave)
  - Complexity: Medium

### Wave 4: Integration (depends on Wave 3)

- **Task 4-1** — Integrate ChartsSection into Statistics page (`src/app/stats/page.tsx`)
  - Use Cases: UC-1, UC-2, UC-3, UC-4
  - Description file: `tasks/task-4-1.md`
  - Priority: High
  - Dependencies: task-3-1
  - Parallelizable: no (single task in this wave)
  - Complexity: Simple

---

## Use Case Coverage

| Use Case | Tasks |
|----------|-------|
| UC-1: View CFD Chart | 1-1, 1-2, 2-1, 3-1, 4-1 |
| UC-2: View Critical Backlog Chart | 1-1, 1-2, 2-2, 3-1, 4-1 |
| UC-3: View Non-Critical Backlog Chart | 1-1, 1-2, 2-2, 3-1, 4-1 |
| UC-4: Charts Respond to Data Changes | 1-2, 3-1, 4-1 |
| UC-5: Fixed vs. Dynamic Metrics | 1-2, 3-1 |

---

## New Files Summary

| File | Task | Purpose |
|------|------|---------|
| `src/lib/chart-utils.ts` | 1-2 | Chart data types + `calculateChartData()` |
| `src/components/stats/charts/CFDChart.tsx` | 2-1 | Stacked area + WIP line chart |
| `src/components/stats/charts/BacklogChart.tsx` | 2-2 | Reusable parameterized line chart |
| `src/components/stats/charts/ChartsSection.tsx` | 3-1 | Container reading atoms, passing data to charts |

## Modified Files Summary

| File | Task | Change |
|------|------|--------|
| `src/app/stats/page.tsx` | 4-1 | Import and render `<ChartsSection />` above period cards |
