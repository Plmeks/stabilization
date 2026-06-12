# Technical Specification: Charts Feature for Statistics Tab

## 1. General Description

### Goal
Add three analytical charts to the Statistics tab (`/app/stats/page.tsx`) of the Stability task management system. The charts provide visual trend analysis of task flow, WIP dynamics, and backlog burndown across periods.

### Relation to Existing System
- Charts are added to the **existing Statistics tab** — no new pages or routes are needed.
- Data is sourced from existing `periods`, `tasks`, and `period_statistics` tables — no schema changes required.
- Charts extend the existing `StatsPeriodCard` component area or are rendered as a separate global section on the stats page.
- Existing `calculateDynamicMetrics()` in `src/lib/stats-utils.ts` provides the calculation pattern; chart data calculation will follow the same approach with per-period cumulative logic.

### Scope
Three charts in the following order (top to bottom):
1. **CFD с линией WIP** — Cumulative Flow Diagram with stacked areas + WIP line
2. **Кумулятивный остаток критичных тикетов** — Critical ticket backlog trend line
3. **Кумулятивный остаток некритичных тикетов** — Non-critical ticket backlog trend line

---

## 2. List of Use Cases

### UC-1: View CFD Chart (NEW)

**Actors:** User, System

**Preconditions:**
- At least one period exists in the system
- The user is on the Statistics tab (`/stats`)

**Main Scenario:**
1. User navigates to the Statistics tab
2. System loads all periods (sorted chronologically ascending) and all tasks
3. System calculates chart data points for each period (see Data Requirements §3)
4. System renders a stacked area chart with the following layers (bottom to top):
   - **Готовые** (green) — cumulative count of tasks with `status = 'Завершена'` created up to and including this period
   - **Критичные** (red/pink) — cumulative count of tasks with `priority = 'Критический'` AND `status ≠ 'Завершена'` created up to and including this period
   - **Некритичные** (orange) — cumulative count of tasks with `priority ≠ 'Критический'` AND `status ≠ 'Завершена'` created up to and including this period
5. System overlays a **dashed blue WIP line** showing WIP count (tasks with `status = 'В работе'` or `status = 'В тесте'`) at each period point
6. X-axis shows date labels: the first point is `start_date - 1 day` of the earliest period (the "zero" anchor), followed by the `end_date` of each period
7. Y-axis shows task count from 0 to the cumulative total (top of the stacked areas)
8. Chart displays title "CFD с линией WIP" above the chart area
9. Chart displays a legend identifying all four series (three areas + WIP line)

**Alternative Scenarios:**
- **5a. No tasks exist yet:** Chart renders with all-zero data points (empty chart with axes and labels visible)
- **5b. All tasks are completed:** The "Критичные" and "Некритичные" areas are zero; only "Готовые" area is shown; WIP line is at zero
- **5c. Single period exists:** Chart shows two X-axis points (anchor date + period end_date) with a single data segment
- **5d. Period has no fixed statistics:** System uses dynamically calculated metrics from `calculateDynamicMetrics()` for that period's data point

**Postconditions:**
- User sees a fully rendered CFD chart with correct cumulative stacking

**Acceptance Criteria:**
1. Three stacked areas are rendered in the correct order (Готовые bottom, Некритичные top)
2. The top of the stacked area equals `total_problems_cumulative` for each period
3. WIP dashed line overlays the areas correctly
4. X-axis starts with `(first_period.start_date - 1 day)` formatted as `DD.MM`
5. X-axis subsequent points are `end_date` of each period formatted as `DD.MM`
6. Colors match the provided screenshots: green, red/pink, orange areas; blue dashed WIP line
7. Legend is visible and correctly identifies all four series
8. Chart title "CFD с линией WIP" is displayed

---

### UC-2: View Cumulative Critical Backlog Chart (NEW)

**Actors:** User, System

**Preconditions:**
- At least one period exists
- User is on the Statistics tab

**Main Scenario:**
1. User navigates to the Statistics tab
2. System loads all periods and tasks
3. For each period, system calculates the cumulative remaining critical tickets: `uncompleted_critical` (tasks with `priority = 'Критический'` AND `status ≠ 'Завершена'` created up to and including that period)
4. System renders a line chart connecting these data points
5. X-axis shows period labels formatted as date ranges (`DD.MM-DD.MM`) or end dates
6. Y-axis shows "Остаток" (backlog count) — the remaining critical ticket count
7. Chart displays title "Кумулятивный остаток критичных тикетов"
8. Line is styled in a red/coral color with data point markers, matching the screenshots

**Alternative Scenarios:**
- **3a. No critical tasks exist:** Line is at zero for all points
- **3b. All critical tasks completed in a period:** The value can reach zero; chart should handle Y-axis range accordingly (not negative)
- **3c. Critical backlog increases:** The line goes up (new critical tasks added exceed completions) — this is a valid state

**Postconditions:**
- User sees the critical backlog trend over time

**Acceptance Criteria:**
1. Line chart renders with correct data points per period
2. Each data point value matches `uncompleted_critical` from the metrics (fixed or dynamic)
3. X-axis labels show period date ranges or end dates
4. Y-axis label shows "Остаток"
5. Line color is red/coral matching the screenshots
6. Data point markers (circles) are visible on each point
7. Chart title "Кумулятивный остаток критичных тикетов" is displayed

---

### UC-3: View Cumulative Non-Critical Backlog Chart (NEW)

**Actors:** User, System

**Preconditions:**
- At least one period exists
- User is on the Statistics tab

**Main Scenario:**
1. User navigates to the Statistics tab
2. System loads all periods and tasks
3. For each period, system calculates the cumulative remaining non-critical tickets: `uncompleted_non_critical` (tasks with `priority ≠ 'Критический'` AND `status ≠ 'Завершена'` created up to and including that period)
4. System renders a line chart connecting these data points
5. X-axis shows period labels formatted as date ranges (`DD.MM-DD.MM`) or end dates
6. Y-axis shows "Остаток" (backlog count)
7. Chart displays title "Кумулятивный остаток некритичных тикетов"
8. Line is styled in an orange color with data point markers, matching the screenshots

**Alternative Scenarios:**
- **3a. No non-critical tasks exist:** Line is at zero for all points
- **3b. Backlog fluctuates:** The line can go up or down depending on the balance of new tasks vs. completions

**Postconditions:**
- User sees the non-critical backlog trend over time

**Acceptance Criteria:**
1. Line chart renders with correct data points per period
2. Each data point value matches `uncompleted_non_critical` from the metrics (fixed or dynamic)
3. X-axis labels show period date ranges or end dates
4. Y-axis label shows "Остаток"
5. Line color is orange matching the screenshots
6. Data point markers (circles) are visible on each point
7. Chart title "Кумулятивный остаток некритичных тикетов" is displayed

---

### UC-4: Charts Respond to Data Changes (NEW)

**Actors:** User, System

**Preconditions:**
- Charts are rendered on the Statistics tab
- User performs an action that changes task/period data (e.g., completes a task, creates a period, locks metrics)

**Main Scenario:**
1. User performs a data-changing action (complete task, create period, lock/delete metrics, etc.)
2. Jotai atoms (`periodsAtom`, `tasksAtom`, `periodStatisticsAtom`) update reactively
3. Chart data is recalculated from the updated atom values
4. Charts re-render with updated data points

**Alternative Scenarios:**
- **3a. Metrics are locked (fixed):** For periods with `period_statistics` records, chart data uses the fixed snapshot values instead of dynamic calculation
- **3b. Metrics are deleted:** Chart reverts to dynamically calculated values for that period

**Postconditions:**
- Charts always reflect the current state of data

**Acceptance Criteria:**
1. Completing a task updates all three charts without page reload
2. Locking/unlocking metrics updates chart data source accordingly
3. Creating or deleting a period updates the X-axis and data points
4. No manual refresh is needed — charts update reactively via Jotai

---

### UC-5: Charts Use Fixed vs. Dynamic Metrics (NEW)

**Actors:** System

**Preconditions:**
- Some periods have fixed statistics (`period_statistics` record exists), others do not

**Main Scenario:**
1. System iterates over all periods sorted chronologically
2. For each period, system checks if a `period_statistics` record exists
3. If **fixed statistics exist**: use `completed_cumulative`, `uncompleted_critical`, `uncompleted_non_critical`, `wip_total`, `total_problems_cumulative` from the `period_statistics` record
4. If **no fixed statistics**: calculate metrics dynamically using the same logic as `calculateDynamicMetrics()`
5. Chart data points are assembled from the mixed sources

**Alternative Scenarios:**
- **2a. All periods have fixed statistics:** All chart data comes from `period_statistics`
- **2b. No periods have fixed statistics:** All chart data is dynamically calculated

**Postconditions:**
- Chart data correctly reflects the canonical metric source for each period

**Acceptance Criteria:**
1. Fixed and dynamic metric sources produce consistent chart data
2. The system prefers fixed statistics when available
3. Metrics fields used: `total_problems_cumulative`, `completed_cumulative`, `uncompleted_critical`, `uncompleted_non_critical`, `wip_total`

---

## 3. Data Requirements

### 3.1 Data Source Strategy

**Decision: Calculate on-demand from existing data. No new database tables or schema changes.**

Rationale:
- The existing `period_statistics` table already stores all needed cumulative metrics as snapshots
- The existing `calculateDynamicMetrics()` function already computes these values for periods without snapshots
- The dataset is small (tens of periods, hundreds of tasks) — on-demand calculation is performant
- Adding a separate chart data table would create redundancy and synchronization issues

### 3.2 Data Points Per Chart

#### CFD Chart Data Point (per period)
Each period produces one data point with four values:

| Field | Source (fixed) | Source (dynamic) | Description |
|-------|---------------|-----------------|-------------|
| `completed` | `completed_cumulative` | Count of tasks with `status = 'Завершена'` created up to this period | Cumulative completed tasks |
| `critical` | `uncompleted_critical` | Count of tasks with `priority = 'Критический'` AND `status ≠ 'Завершена'` created up to this period | Cumulative uncompleted critical |
| `nonCritical` | `uncompleted_non_critical` | Count of tasks with `priority ≠ 'Критический'` AND `status ≠ 'Завершена'` created up to this period | Cumulative uncompleted non-critical |
| `wip` | `wip_total` | Count of tasks with `status IN ('В работе', 'В тесте')` in this period's active tasks | WIP at this period snapshot |
| `total` | `total_problems_cumulative` | Total tasks created up to this period | Stacking check: `completed + critical + nonCritical = total` |

**Stacking invariant:** `completed + critical + nonCritical` should equal `total_problems_cumulative`. This is because every task created up to a given period is in exactly one of these three states: completed, uncompleted-critical, or uncompleted-non-critical.

#### X-Axis Anchor Point
- The **first X-axis point** is an artificial "zero" anchor: `(first_period.start_date - 1 day)` with all values = 0
- This ensures the chart starts from zero and the first period's data shows as growth from the baseline

#### Backlog Charts Data Point (per period)
Each period produces one data point:

| Chart | Field | Source (fixed) | Source (dynamic) |
|-------|-------|---------------|-----------------|
| Critical backlog | `value` | `uncompleted_critical` | Dynamic calc |
| Non-critical backlog | `value` | `uncompleted_non_critical` | Dynamic calc |

### 3.3 Chart Data Calculation Function

A new utility function should be created (e.g., in `src/lib/chart-utils.ts`) that:

1. Takes `periods: Period[]`, `tasks: Task[]`, `periodStatistics: PeriodStatistics[]` as input
2. Sorts periods chronologically (ascending by `start_date`)
3. For each period, resolves metrics from fixed stats or dynamic calculation
4. Returns a typed array of chart data points ready for the charting library

```typescript
type ChartDataPoint = {
  date: string;        // formatted date for X-axis label (DD.MM)
  rawDate: string;     // ISO date for sorting
  completed: number;   // cumulative completed
  critical: number;    // cumulative uncompleted critical
  nonCritical: number; // cumulative uncompleted non-critical
  wip: number;         // WIP snapshot
  total: number;       // cumulative total (stacking check)
};
```

### 3.4 WIP Data Nuance

The WIP value is special because it is **not purely cumulative** — it is a **snapshot** of how many tasks are currently in work/test status at the time of that period. The WIP line can go up or down over time, unlike the stacked areas which are monotonically non-decreasing in total.

For **fixed statistics**: use `wip_total` directly.
For **dynamic calculation**: use `in_progress + in_testing` from `calculateDynamicMetrics()` — but note this only counts tasks whose `active_period_id` matches the current period. For dynamic metrics, the WIP for past periods may not be accurate because task statuses change over time. This is acceptable — the user understands that fixing metrics is the way to preserve accurate historical snapshots.

---

## 4. UI/UX Requirements

### 4.1 Placement

Charts are rendered as a **global section** on the Statistics page, **above** the per-period cards. This matches the analytical purpose: charts show cross-period trends, while cards show per-period details.

**Layout order on `/stats` page:**
1. "Развернуть все / Свернуть все" button (existing)
2. **Charts section** (new) — three charts stacked vertically
3. Per-period `StatsPeriodCard` components (existing)

**Alternative placement (if user prefers):** Charts could be placed below all period cards. The task description says "Under the metrics for each period" but the charts span all periods, so placing them globally (above or below cards) is the logical approach.

### 4.2 Chart Layout

- Each chart occupies a **full-width row** within the content area
- Charts are wrapped in a styled container (rounded border, padding) consistent with `StatsPeriodCard` styling
- Vertical spacing between charts: `space-y-5` (matching existing page spacing)
- Chart height: ~300-400px (responsive, but fixed aspect ratio)
- Charts should be responsive: on smaller screens, maintain readability with adjusted font sizes

### 4.3 Visual Style (from screenshots)

#### CFD Chart:
- **Background:** White/transparent
- **Stacked areas:** Semi-transparent fills with visible stacking
  - Готовые: `#4ade80` (green-400) or similar green with ~60% opacity
  - Критичные: `#f87171` (red-400) or similar red/pink with ~60% opacity
  - Некритичные: `#fb923c` (orange-400) or similar orange with ~60% opacity
- **WIP Line:** Blue (`#3b82f6`), dashed (`strokeDasharray`), thick (~3px), with no markers
- **Axes:** Light gray grid lines, axis labels in neutral gray text
- **Title:** Centered above chart, medium font weight
- **Legend:** Top-left area, showing colored squares + labels for all four series

#### Backlog Charts:
- **Line style:** Solid line with circular data point markers
- **Critical chart line color:** Red/coral (`#f87171` or similar)
- **Non-critical chart line color:** Orange (`#fb923c` or similar)
- **Marker style:** Filled circles at each data point
- **Grid:** Light horizontal grid lines for readability
- **X-axis labels:** Period date ranges or end dates, rotated if necessary for fit

### 4.4 Interactivity

- **Hover tooltips:** Show exact values when hovering over data points/areas
- **No zoom/pan:** Not required for this scope
- **No click actions:** Charts are view-only
- **Responsive:** Charts should resize with the container; on mobile, charts remain readable (may scroll horizontally if necessary)

### 4.5 Empty State

When no periods exist, the charts section should not render at all (consistent with existing behavior where the page shows nothing when no data exists).

---

## 5. Technical Constraints

### 5.1 Charting Library

**Recommendation: Recharts**

Rationale:
- React-native library (declarative JSX API) — fits the existing React/Next.js stack
- Built-in support for stacked area charts, line charts, and composable overlays
- Supports responsive containers, tooltips, legends, custom styling
- Well-maintained, widely used, good TypeScript support
- Lightweight compared to D3 (no need for low-level SVG manipulation)
- Composable: the CFD chart can combine `<AreaChart>` with `<Line>` overlays in a single `<ComposedChart>`

**Alternatives considered:**
- **Chart.js / react-chartjs-2:** Canvas-based, less React-idiomatic, harder to compose overlays
- **Nivo:** Good but heavier, more opinionated styling
- **Victory:** Less active maintenance, API less intuitive for composed charts
- **D3:** Overkill for this use case; requires manual SVG work

### 5.2 Performance

- Dataset size is small: tens of periods × 4 metrics per point = trivial computation
- Recharts renders SVG — performant for this data volume
- Chart data should be memoized with `useMemo` to avoid recalculation on every render
- No virtualization or lazy loading needed

### 5.3 Compatibility

- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Must work with Next.js 16 App Router (`'use client'` directive required for chart components)
- Must be compatible with Tailwind CSS v4 for layout/spacing
- SSR: Charts are client-only components; use `'use client'` directive

### 5.4 Build & Dependencies

- Install `recharts` via pnpm: `pnpm add recharts`
- No other new dependencies expected
- Ensure `pnpm build` passes after implementation

### 5.5 Existing Constraints

- **Single migration file:** No DB schema changes needed (no migration update required)
- **No tests:** Skip automated tests
- **Medium flow:** Focus on implementation, minimal documentation
- **Jotai for state:** Chart data derived from existing atoms
- **Tailwind for styling:** Layout and spacing via Tailwind; chart-specific styling via Recharts props

---

## 6. Implementation Considerations

### 6.1 Component Architecture

**New files to create:**
1. `src/lib/chart-utils.ts` — Chart data calculation functions
2. `src/components/stats/charts/CFDChart.tsx` — CFD stacked area chart + WIP line
3. `src/components/stats/charts/BacklogChart.tsx` — Reusable line chart for both backlog charts (parameterized by color and data field)
4. `src/components/stats/charts/ChartsSection.tsx` — Container component rendering all three charts

**Modified files:**
1. `src/app/stats/page.tsx` — Import and render `ChartsSection` above period cards

### 6.2 Data Flow

```
periodsAtom + tasksAtom + periodStatisticsAtom
  → ChartsSection component (reads atoms via useAtomValue)
    → calculateChartData() in chart-utils.ts
      → Memoized chart data points
        → CFDChart receives data points
        → BacklogChart (critical) receives data points
        → BacklogChart (non-critical) receives data points
```

### 6.3 Recharts Component Mapping

**CFD Chart** → `<ComposedChart>` or `<AreaChart>` with:
- `<Area>` for Готовые (stackId="1", fill green)
- `<Area>` for Критичные (stackId="1", fill red)
- `<Area>` for Некритичные (stackId="1", fill orange)
- `<Line>` for WIP (dashed, blue, no stackId)
- `<XAxis>`, `<YAxis>`, `<Tooltip>`, `<Legend>`
- Wrapped in `<ResponsiveContainer>`

**Backlog Charts** → `<LineChart>` with:
- `<Line>` with dot markers
- `<XAxis>`, `<YAxis>`, `<Tooltip>`
- Wrapped in `<ResponsiveContainer>`

### 6.4 Key Technical Decisions

1. **Fixed vs. Dynamic metrics for charts:** Use fixed statistics when available, fall back to dynamic calculation. This is consistent with how `StatsPeriodCard` already works.

2. **CFD stacking order:** Recharts stacks areas in render order. Render order must be: Готовые first (bottom), then Критичные, then Некритичные (top). This means the data values are **not** pre-stacked — Recharts handles stacking via `stackId`.

3. **WIP line scope:** The WIP line value for each period represents how many tasks were in 'В работе' or 'В тесте' status at that period. For fixed stats, this is `wip_total`. For dynamic, this is `in_progress + in_testing`. The WIP line is **not** stacked — it overlays the area chart independently.

4. **X-axis date formatting:** Use `DD.MM` format (e.g., "08.01", "15.01") matching the screenshots. The anchor point (day before first period) is calculated as `dayjs(first_period.start_date).subtract(1, 'day').format('DD.MM')`.

5. **Responsive container:** Use Recharts' `<ResponsiveContainer width="100%" height={350}>` to make charts responsive.

### 6.5 Edge Cases

- **Period with no tasks:** Data point has all zeros — chart shows flat line/area at zero for that period
- **Gap in periods:** Periods are plotted by their chronological order; gaps in dates are not represented (the chart connects adjacent period points directly)
- **Very many periods (>20):** X-axis labels may overlap. Consider rotating labels 45° or abbreviating. Recharts supports `<XAxis angle={-45}>` and `tick` customization.
- **Priority null tasks:** Tasks with `priority = null` should be counted as non-critical (they are not 'Критический')

---

## 7. Acceptance Criteria

### Global
1. Three charts are visible on the Statistics tab when at least one period exists
2. Charts are positioned above (or below) the per-period statistics cards
3. Charts render without errors in development (`pnpm dev`) and production build (`pnpm build`)
4. No TypeScript errors or linter warnings introduced
5. Charts update reactively when underlying data changes (task completion, metric locking, etc.)

### CFD Chart
6. Stacked area chart displays three correctly colored areas: green (Готовые), red/pink (Критичные), orange (Некритичные)
7. Areas stack correctly — the total height equals `total_problems_cumulative`
8. Dashed blue WIP line overlays the areas
9. X-axis starts with the anchor date (day before first period's start_date)
10. Legend identifies all four series
11. Title reads "CFD с линией WIP"

### Critical Backlog Chart
12. Line chart with red/coral line and dot markers
13. Data points show `uncompleted_critical` per period
14. Title reads "Кумулятивный остаток критичных тикетов"
15. Y-axis labeled "Остаток"

### Non-Critical Backlog Chart
16. Line chart with orange line and dot markers
17. Data points show `uncompleted_non_critical` per period
18. Title reads "Кумулятивный остаток некритичных тикетов"
19. Y-axis labeled "Остаток"

### Design
20. Visual style matches the provided screenshot examples (colors, layout, proportions)
21. Charts are responsive and usable on desktop and tablet widths
22. Consistent with the existing Stability app aesthetic (rounded borders, spacing, font styles)

---

## 8. Non-Functional Requirements

- **Performance:** Charts render within 100ms for up to 50 periods. No perceivable lag.
- **Accessibility:** Chart colors should have sufficient contrast. Tooltips provide exact numerical values for screen reader context.
- **Bundle size:** Recharts adds ~200KB to the bundle (gzipped ~60KB). Acceptable for this application.
- **Browser support:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

---

## 9. Constraints and Assumptions

### Constraints
- No database schema changes
- Single migration file pattern preserved
- No automated tests
- Must use existing Jotai atom architecture
- Must be client-side rendered (`'use client'`)

### Assumptions
1. **Priority null = non-critical:** Tasks without an explicit priority are treated as non-critical in chart calculations (they do not have `priority = 'Критический'`)
2. **WIP includes only 'В работе' and 'В тесте':** The 'Блокер' status is not included in the WIP line (matching the existing `wip_total` calculation in `calculateDynamicMetrics`)
3. **Charts are global, not per-period:** All charts show data across ALL periods simultaneously, not within a single period's accordion
4. **Historical accuracy for dynamic metrics:** For periods without fixed statistics, the dynamic calculation reflects the CURRENT state of tasks, not the historical state. Users who want accurate historical data should lock metrics.
5. **Chart visibility:** Charts are always visible when periods exist, regardless of whether statistics are locked. There is no toggle to hide/show charts.

---

## 10. Open Questions

1. **Chart placement — above or below period cards?** The task says "under the metrics for each period" but charts span all periods. Recommendation: place above period cards as a global overview section. Needs user confirmation.

2. **X-axis labels for backlog charts — date ranges or end dates?** The screenshots show both formats (`DD.MM-DD.MM` on backlog charts, `DD.MM` on CFD). Should both formats be supported, or should one be standardized?

3. **Should charts be collapsible?** The existing page has collapsible period cards. Should the charts section also be collapsible to save screen space, or always visible?

---

## 11. Anticipated Architecture Questions

1. **Chart component granularity:** Should `BacklogChart` be a single reusable component parameterized by color/dataKey, or two separate components? (Recommendation: single reusable component)

2. **Chart data memoization strategy:** Should chart data be computed in a derived Jotai atom or via `useMemo` in the component? (Recommendation: `useMemo` in `ChartsSection` — simpler, no need for a new atom since charts are only on one page)

3. **Recharts tree-shaking:** Recharts supports importing individual components (`import { AreaChart } from 'recharts'`). Ensure imports are granular to minimize bundle size.
