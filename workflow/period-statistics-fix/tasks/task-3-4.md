# Task 3.4: Add "Создана в периоде" Column to Current Tasks Table

## Related Use Cases
- UC-13: Display Creation Period on Current Tasks Tab

## Task Goal
Add a new "Создана в периоде" column to `CurrentTasksTable` that displays the task's creation period dates in compact plain text with a line break. The column resolves the period using `task.creation_period_id`.

## Description of Changes

### Changed Files

#### File: `src/components/current/CurrentTasksTable.tsx`

**`getPeriod` helper**

Update to look up by `creation_period_id` instead of `period_id`:

Old:
```ts
const getPeriod = (periodId: string): Period | undefined =>
  periods.find((p) => p.id === periodId);
```

This function is unchanged in signature; just ensure the call site uses `task.creation_period_id`.

**Table header — add new column**

Add a new `<TableHead>` between the "Приоритет" and "Статус" headers:

```tsx
<TableHead className="px-4 w-[110px]">Создана в периоде</TableHead>
```

Width `w-[110px]` provides a narrow, text-wrapping column.

**Table row — pass creation period to row component**

Update the `CurrentTasksRow` instantiation to pass the creation period:

Old:
```tsx
<CurrentTasksRow
  key={task.id}
  task={task}
  period={getPeriod(task.period_id)}
  onEdit={() => onEdit(task)}
  onReturnToQA={() => onReturnToQA(task.id)}
/>
```

New:
```tsx
<CurrentTasksRow
  key={task.id}
  task={task}
  period={getPeriod(task.creation_period_id)}
  creationPeriod={getPeriod(task.creation_period_id)}
  onEdit={() => onEdit(task)}
  onReturnToQA={() => onReturnToQA(task.id)}
/>
```

Note: the existing `period` prop and the new `creationPeriod` prop currently resolve to the same value (both use `task.creation_period_id`). The `period` prop was previously unused in `CurrentTasksRow` — it can be kept for interface consistency or removed. The new `creationPeriod` prop is what the row uses to render the new column.

---

#### File: `src/components/current/CurrentTasksRow.tsx`

**Props interface — add `creationPeriod`**

Update `CurrentTasksRowProps`:

Old:
```ts
interface CurrentTasksRowProps {
  task: Task;
  period: Period | undefined;
  onEdit: () => void;
  onReturnToQA: () => void;
}
```

New:
```ts
interface CurrentTasksRowProps {
  task: Task;
  period: Period | undefined;
  creationPeriod: Period | undefined;
  onEdit: () => void;
  onReturnToQA: () => void;
}
```

**Component function — destructure `creationPeriod` and add new cell**

Update the destructuring:
```ts
export function CurrentTasksRow({ task, creationPeriod, onEdit, onReturnToQA }: CurrentTasksRowProps) {
```

Add a new `<TableCell>` between the "Приоритет" cell and the "Статус" cell, formatted as per the TS acceptance criteria:

```tsx
<TableCell className="px-4 py-3 w-[110px] text-xs text-muted-foreground leading-tight">
  {creationPeriod ? (
    <>
      {dayjs(creationPeriod.start_date).format('DD.MM.YYYY')} -{'\n'}
      <br />
      {dayjs(creationPeriod.end_date).format('DD.MM.YYYY')}
    </>
  ) : '—'}
</TableCell>
```

The `<br />` after the dash ensures the end date appears on a new line within the narrow column. The `text-xs` and `leading-tight` keep it compact. No badge or pill styling.

**Import `dayjs`** — add at the top of `CurrentTasksRow.tsx` (it's already imported via the existing date formatting for `taken_into_work_at`).

**All other cells** in `CurrentTasksRow` remain unchanged.

## Acceptance Criteria
- [ ] A "Создана в периоде" column header is visible in `CurrentTasksTable`
- [ ] The column appears between "Приоритет" and "Статус"
- [ ] Each row displays the creation period formatted as `DD.MM.YYYY -` (line break) `DD.MM.YYYY`
- [ ] The column uses plain text with no badge/pill styling
- [ ] The column is narrow (≈110px) with text wrapping
- [ ] The column shows the creation period even when `task.active_period_id` differs
- [ ] If the creation period cannot be resolved (edge case), the cell shows `—`
- [ ] All existing columns and their behavior are unchanged

## Notes
The `period` prop on `CurrentTasksRow` was already unused in the component body (the function destructured `{ task, onEdit, onReturnToQA }` without `period`). This task re-exposes it as `creationPeriod` with a meaningful name. The old `period` prop can remain in the interface for interface stability or be removed — either is acceptable.
