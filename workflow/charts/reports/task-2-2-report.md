# Task 2.2 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/stats/charts/BacklogChart.tsx` — reusable parameterized `LineChart` component for backlog visualization; accepts `data`, `dataKey`, `color`, and `title` props; renders null when data is empty

### Modified files:
- none

## Notes
- Build: `pnpm build` passes with no TypeScript errors
- Lint: `pnpm eslint` reports no violations
- Component uses granular named imports from `recharts` as specified
- Y-axis label "Остаток" with angle -90 and `insideLeft` position implemented
- `dot={{ r: 4, fill: color }}` and `activeDot={{ r: 6 }}` match the spec exactly
- `ResponsiveContainer` height set to 250 as required
