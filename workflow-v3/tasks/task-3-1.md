# Task 3.1: New UI Components (StatsMetricGroup + StatsComment) + StatsMetricItem Update

## Related Use Cases
- UC-4: Add/Edit Comment for Locked Period Statistics
- UC-5: View Metrics in Grouped Layout

## Task Goal
Create two new reusable components (`StatsMetricGroup` for section containers and `StatsComment` for the debounced comment textarea), and add a sub-metric visual variant to the existing `StatsMetricItem`. These components are consumed by `StatsPeriodCard` in task 3.2.

## Description of Changes

### New Files

#### File: `src/components/stats/StatsMetricGroup.tsx`

A presentational component that renders a labeled section with a subtle visual separator.

Props interface:
```typescript
interface StatsMetricGroupProps {
  title: string;
  children: React.ReactNode;
}
```

Rendering logic:
- Outer `div` with a bottom border or `border-b` to separate sections, with `pb-4` padding
- A `p` or `h3` element for the title: small font (`text-xs`), muted foreground color (`text-muted-foreground`), uppercase, letter-spaced (`tracking-wide font-semibold`), with `mb-3` margin below
- A `div` children container — use a responsive grid matching the pattern used in the existing `StatsPeriodCard` (e.g., `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4`)

#### File: `src/components/stats/StatsComment.tsx`

A client component with debounced auto-save behavior.

Props interface:
```typescript
interface StatsCommentProps {
  statisticsId: string;
  initialComment: string | null;
}
```

Internal state and logic:
- `localComment: string` — initialized to `initialComment ?? ''`
- `saveError: string | null` — for showing inline error message
- `isSaving: boolean` — to show a subtle saving indicator
- `debounceRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>` — holds the debounce timer ID
- `pendingSaveRef: React.MutableRefObject<string | null>` — holds the latest unsaved comment value for flush-on-unmount

`useSetAtom(updatePeriodCommentAtom)` from `@/atoms/statsAtom`

**On input change (`handleChange`):**
1. Update `localComment` state
2. Store value in `pendingSaveRef.current`
3. Clear existing debounce timer (`clearTimeout(debounceRef.current)`)
4. Set new timer for 700ms that calls `doSave(value)`

**`doSave(comment: string)` function:**
1. Set `isSaving = true`, `saveError = null`
2. Call `await updatePeriodComment({ statisticsId, comment: comment === '' ? null : comment })`
3. On success: set `isSaving = false`, clear `pendingSaveRef.current`
4. On error: set `isSaving = false`, set `saveError = 'Не удалось сохранить'`

**On unmount (`useEffect` cleanup):**
1. Clear the debounce timer
2. If `pendingSaveRef.current !== null`, call `doSave(pendingSaveRef.current)` immediately (fire-and-forget — do not await in cleanup)

Rendering:
- Section wrapper `div` with `space-y-1.5`
- `Textarea` component from `@/components/ui/textarea` (shadcn)
- Placeholder: `'Добавить комментарий к периоду...'`
- `rows={3}` or `className` controlling min-height
- When `isSaving`: show a subtle `text-xs text-muted-foreground` label `'Сохранение...'` below the textarea
- When `saveError`: show `text-xs text-destructive` label with the error message below the textarea

### Changes to Existing Files

#### File: `src/components/stats/StatsMetricItem.tsx`

Add an optional `isSubMetric?: boolean` prop.

When `isSubMetric` is true:
- Use `text-xl` for the value (instead of `text-2xl`)
- Add `pl-3` left padding or `ml-3` left margin to visually indent the item
- Use `bg-muted/20` background (slightly lighter than the default `bg-muted/30`)

The existing default rendering (when `isSubMetric` is `false` or omitted) must remain unchanged.

## Acceptance Criteria
- [ ] `StatsMetricGroup` renders a titled section with children in a grid layout
- [ ] `StatsMetricGroup` has a visual separator between sections (border or spacing)
- [ ] `StatsComment` textarea is a client component with `'use client'` directive
- [ ] `StatsComment` auto-saves after 700ms debounce
- [ ] `StatsComment` flushes pending save on unmount (fire-and-forget)
- [ ] `StatsComment` shows inline error text on save failure (no toast required)
- [ ] `StatsComment` saves `null` when textarea is cleared (empty string → null)
- [ ] `StatsMetricItem` accepts `isSubMetric` prop and renders smaller/indented when true
- [ ] All new files have `'use client'` directive
- [ ] No TypeScript errors in any new or modified file

## Notes
- The `Textarea` component from shadcn should already be available at `@/components/ui/textarea`. If it is not, the developer should add it via `npx shadcn@latest add textarea`.
- The cleanup flush is fire-and-forget (`void doSave(...)` without await) because React cleanup functions cannot be async.
- `saveError` should reset to `null` on the next successful save.
