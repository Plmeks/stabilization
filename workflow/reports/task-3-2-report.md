# Task 3.2 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/shared/PeriodAccordion.tsx` — collapsible period container with header (chevron + date range + task counter + headerActions slot) and animated body

## Notes
- Animation uses the CSS `grid-rows` trick (`grid-rows-[1fr]` / `grid-rows-[0fr]`) which avoids the max-height animation flicker and works without a known height
- `headerActions` click is stopped from propagating to the toggle handler so buttons inside don't accidentally collapse/expand the accordion
- `formatPeriodLabel` and `cn` are imported from `@/lib/utils` as a single import
- No tests per client request
