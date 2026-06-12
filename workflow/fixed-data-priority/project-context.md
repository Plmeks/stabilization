# Project Context: Task Management System

## Documentation Directory
Not specified.

## Project Overview
A Next.js task management system for tracking team tasks across periods. Features:
- Task lifecycle management (QA → Current → Completed)
- Period-based statistics with manual fixation capability
- Charts visualization (CFD, cumulative backlogs)
- Statistics tab with fixed vs dynamic metrics

## Relevant Architecture

### Statistics System
- **Dynamic metrics**: Calculated from actual tasks in real-time (`calculateDynamicMetrics()`)
- **Fixed metrics**: Manually entered and stored in `period_statistics` table
- **Current behavior**: 
  - Stats tab: uses fixed if available, otherwise dynamic
  - Charts: uses fixed if available, otherwise dynamic (but has issues)

### Database Schema (relevant tables)
- `periods`: date ranges for tracking
- `tasks`: has `creation_period_id` and `active_period_id`
- `period_statistics`: stores fixed metrics per period

### Key Files
- `src/lib/stats-utils.ts`: `calculateDynamicMetrics()` - computes metrics from tasks
- `src/lib/chart-utils.ts`: `calculateChartData()` - generates chart data points
- `src/components/stats/charts/ChartsSection.tsx`: renders charts

## Current Issues
1. **Charts show 0 when only fixed data exists**: If a period has fixed statistics but no actual tasks, charts display 0 instead of using the fixed values
2. **Cumulative metrics ignore fixed data**: Subsequent periods don't consider fixed statistics from previous periods when calculating cumulative values (e.g., `completed_cumulative`, `total_problems_cumulative`)

## Technical Constraints
- Medium pipeline (no architecture phase)
- Minimal documentation
- Fast implementation
