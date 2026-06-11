# Task 3.5 Result

## Status
✅ Task completed successfully

## Changed Files

### New files:
- `src/components/shared/TaskTitle.tsx` — renders task title with URLs converted to clickable links

## Notes
- Uses `detectUrls` from `@/lib/utils` (already implemented) to split the title into plain-text and URL segments
- URL segments render as `<a href={url} target="_blank" rel="noopener noreferrer">` with `text-blue-600 underline hover:text-blue-800` styling
- Plain-text segments render as `<span>`
- The wrapper `<span>` includes `break-all` to handle long URLs that would otherwise overflow
- Both `detectUrls` and `cn` are imported from `@/lib/utils`
- No linter errors
