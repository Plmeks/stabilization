# Task 3.2: EditMetricsModal

## Related Use Cases
- UC-7: Edit locked metrics — modal with 6 pre-filled fields, Save / Cancel

## Task Goal

Create a new `EditMetricsModal` component and wire the "Редактировать" button in `StatsPeriodCard` to open it.

## Description of Changes

### New Files

- `src/components/modals/EditMetricsModal.tsx` — modal with 6 number input fields for editing period_statistics

### Changes to Existing Files

#### File: `src/components/modals/EditMetricsModal.tsx` (new)

**Component interface**:
```
interface EditMetricsModalProps {
  open: boolean;
  onClose: () => void;
  statistics: PeriodStatistics;
}
```

**Internal state**: 6 separate `useState` hooks, each initialized from `statistics` prop (or a single object state — prefer object for brevity):
```
{ added_to_backlog, added_critical, resolved_total, resolved_critical, in_progress, in_testing }
```

**Layout**: Use `ModalWrapper` component. Title: "Редактировать метрики".

**Fields** (render as a 2-column grid using `div` with Tailwind `grid grid-cols-2 gap-4`):
- Добавлено в беклог → `added_to_backlog`
- Из них критических → `added_critical`
- Решено всего → `resolved_total`
- Решено критических → `resolved_critical`
- В работе → `in_progress`
- В тесте → `in_testing`

Each field: `<Label>` + `<Input type="number" min="0">`. The value is converted to number on change (use `parseInt(e.target.value, 10) || 0`).

**Footer buttons**: "Отмена" (variant="outline", calls `onClose`) and "Сохранить" (calls save handler, disabled while loading).

**Save handler**:
1. Set loading = true
2. Call `updatePeriodStatisticsAtom` from `@/atoms/statsAtom` with `{ id: statistics.id, metrics: { ...currentValues } }`
3. On success: call `onClose()`
4. On error: show inline error message ("Не удалось сохранить")
5. Set loading = false in finally

**Imports**: `ModalWrapper`, `Button`, `Input`, `Label` from shadcn/ui, `useSetAtom` from jotai, `updatePeriodStatisticsAtom` from `@/atoms/statsAtom`, `PeriodStatistics` from `@/types`.

#### File: `src/components/stats/StatsPeriodCard.tsx`

**Add state for modal**:
- `const [editOpen, setEditOpen] = React.useState(false)`

**Wire the edit button**:
- The "Редактировать" button's `onClick` should call `setEditOpen(true)`

**Render the modal**:
- When `statistics !== null && editOpen`, render:
  ```jsx
  <EditMetricsModal
    open={editOpen}
    onClose={() => setEditOpen(false)}
    statistics={statistics}
  />
  ```
- Import `EditMetricsModal` from `@/components/modals/EditMetricsModal`
- Import `React` (for useState)

## Acceptance Criteria
- [ ] `EditMetricsModal` exists and renders via `ModalWrapper`
- [ ] Modal pre-fills all 6 fields with current `statistics` values
- [ ] All 6 fields are numeric inputs
- [ ] "Сохранить" calls `updatePeriodStatisticsAtom` and closes on success
- [ ] "Отмена" closes without saving
- [ ] Error message shown on save failure
- [ ] "Редактировать" button in `StatsPeriodCard` opens the modal
- [ ] TypeScript compilation passes

## Notes

- `statistics` prop is guaranteed non-null when the modal opens (caller checks `statistics !== null` before rendering)
- The modal should re-initialize its state when `statistics` prop changes (use a `key={statistics.id}` on the modal, or `useEffect` with `statistics` as dependency — prefer `key` approach for simplicity)
