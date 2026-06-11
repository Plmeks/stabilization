# Task 6.2: Badges + Tables + Modals + Stats Components Redesign

## Related Use Cases
- UC-1 through UC-7: Cross-cutting visual polish on component level

## Task Goal

Apply the modern design language to shared badge components, table rows, modal wrappers, and stats display components. Focus on rounded styles, softer colors, increased row height, and more padding in modals.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/shared/StatusBadge.tsx`

- Read the file first to understand current implementation
- Update badge styling to use `rounded-full` (pill shape) instead of `rounded` or `rounded-md`
- Ensure the color classes from `STATUS_COLORS` constant are applied with slightly increased padding: `px-2.5 py-0.5` instead of default badge padding
- If using shadcn `<Badge>`: pass the color classes via `className` with `rounded-full px-2.5`
- The `'Бэклог'` case will no longer exist after task 1.1 — the component should handle `null` status gracefully (show nothing or a placeholder dash)

#### File: `src/components/shared/PriorityBadge.tsx`

- Same styling approach as `StatusBadge`: `rounded-full`, slightly increased padding
- Read file first to understand current structure

#### File: `src/components/shared/PeriodBadge.tsx`

- Apply consistent rounded pill styling (`rounded-full`)
- Read file first for current implementation

#### File: `src/components/shared/ModalWrapper.tsx`

- Read the file first
- Increase padding inside the modal content area: if currently `p-4`, change to `p-6`
- Increase padding in the modal header/footer areas similarly
- Increase `rounded` on the modal dialog to `rounded-xl` or `rounded-2xl` if using shadcn Dialog
- Ensure footer has `gap-3` between buttons (instead of `gap-2`)

#### File: `src/components/current/CurrentTasksRow.tsx`

- Increase table cell padding: add `py-3` to `<TableCell>` where not already present
- This effectively increases row height without touching the Table component itself

#### File: `src/components/current/CurrentTasksTable.tsx`

- Ensure `<TableHead>` cells have comfortable padding
- Consider adding a subtle `border-b` styling to distinguish header from body (if not already there)

#### File: `src/components/completed/CompletedTasksRow.tsx`

- Same row height increase as `CurrentTasksRow`: add `py-3` to `<TableCell>`

#### File: `src/components/completed/CompletedTasksTable.tsx`

- Same header styling as `CurrentTasksTable`

#### File: `src/components/stats/StatsPeriodCard.tsx`

- Add `shadow-sm` to the outer card div (if not already added in task 3.1)
- Increase the header area padding to `px-5 py-4`
- Increase the metrics section padding to `px-5 py-5`
- Change `rounded-lg` to `rounded-xl` on the card

#### File: `src/components/stats/StatsMetricItem.tsx`

- Add a subtle visual container: wrap the metric in a `div` with `bg-muted/30 rounded-lg p-3` for a "metric card" appearance
- The label: `text-xs text-muted-foreground font-medium uppercase tracking-wide`
- The value: keep `text-xl font-semibold tabular-nums` but increase to `text-2xl` for better visual weight

## Acceptance Criteria
- [ ] All badge components use `rounded-full` pill style
- [ ] Modal content has `p-6` padding (increased from `p-4`)
- [ ] Table rows in Current and Completed tabs have increased row height via `py-3` cell padding
- [ ] `StatsMetricItem` has a "metric card" background container
- [ ] `StatsPeriodCard` has `shadow-sm` and `rounded-xl`
- [ ] All components compile without TypeScript errors
- [ ] No functional regressions (only className changes in this task)

## Notes

- Read each file before modifying — current exact class names matter for targeted changes
- If a badge component uses a shadcn `<Badge>` internally, pass additional classes via the `className` prop
- `StatusBadge` must handle `status === null` gracefully — it likely already renders nothing or `—` for null; verify and keep that behavior
- Table padding changes only affect className attributes, no structural changes
