# Task 3.5: TaskTitle (URL Detection)

## Related Use Cases
- UC-2: Add QA Task

## Goal
A component that renders a task title as plain text or with URLs converted to clickable links.

## Changes

### New Files

#### `src/components/shared/TaskTitle.tsx`
- Props:
  - `title: string`
  - `className?: string`
- Calls `detectUrls(title)` from `src/lib/utils.ts` to split the string into segments
- For each segment: plain text renders as `<span>`, URL renders as `<a href={url} target="_blank" rel="noopener noreferrer">` with `text-blue-600 underline hover:text-blue-800`
- The whole component wraps in a `<span>` with `break-all` to handle long URLs

## Notes
- `detectUrls` should use a simple URL regex: detect `http://` and `https://` prefixed strings
- No need for a heavy URL parsing library
