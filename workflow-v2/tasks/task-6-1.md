# Task 6.1: Navigation + Layout + Page-Level Spacing Redesign

## Related Use Cases
- UC-1 through UC-7: Cross-cutting design improvement visible on all tabs

## Task Goal

Apply the modern IT-product visual language (Bitrix24/Supabase/Vercel style) to the navigation bar, period accordion, root layout, and page-level containers. Focus on spacing, shadows, and border-radius.

## Description of Changes

### Changes to Existing Files

#### File: `src/components/layout/TabNavigation.tsx`

- **Outer `<nav>`**: add `shadow-sm` for a subtle bottom shadow; increase bottom padding: `py-3` instead of `py-2`
- **Brand logo area**: increase `mr-6` (or `mr-8`), make font slightly larger (`text-xl` → `text-2xl`), use a subtler text color (`text-foreground` with heavier weight)
- **Tab buttons**: active tab: use `rounded-lg` (more rounded), ensure the active variant has a noticeable but non-garish selected state; inactive buttons: `ghost` variant with generous horizontal padding `px-4`
- **Overall container**: add `max-w-screen-2xl mx-auto` or `px-6` for breathing room on large screens

#### File: `src/components/shared/PeriodAccordion.tsx`

- **Outer `<div>`**: add `shadow-sm` class; increase `rounded-lg` to `rounded-xl` for a more modern card appearance
- **Header `<div>`**: increase vertical padding from `py-3` to `py-4`; add `px-5` (was `px-4`); slightly increase font size of the period label text to `text-sm font-semibold`
- **Task count badge**: style as a more refined pill — `bg-muted/80 text-muted-foreground text-xs px-2.5 py-0.5 rounded-full`
- **Critical count**: style with a subtle red tint — `text-red-500` (only when criticalCount > 0)
- **Hover state**: `hover:bg-muted/50` (was `hover:bg-muted/60`) — keep it subtle

#### File: `src/app/layout.tsx`

- Wrap the `<main>` content area in a container with `max-w-screen-xl mx-auto px-4 sm:px-6` for consistent page margins
- Increase the vertical spacing between the nav and content: add `pt-6` or `py-6` to the main content area

#### File: `src/app/qa/page.tsx`

- Add `p-6` (or `px-6 py-5`) to the page wrapper div (currently uses `flex flex-col gap-4` with no padding — add padding for breathing room)
- Increase `gap-4` to `gap-5` between period sections

#### File: `src/app/current/page.tsx`

- Increase padding from `p-4` to `p-6`
- Adjust heading area spacing if needed

#### File: `src/app/completed/page.tsx`

- Increase padding from `p-4` to `p-6`
- Adjust gap from `gap-4` to `gap-5`

#### File: `src/app/stats/page.tsx`

- Increase padding from `p-4` to `p-6`
- Increase gap from `gap-4` to `gap-5`

## Acceptance Criteria
- [ ] `TabNavigation` has subtle shadow and more spacious padding
- [ ] Active tab has clearly visible rounded selected style
- [ ] `PeriodAccordion` looks like a card with shadow and increased padding
- [ ] All pages have consistent `p-6` outer padding
- [ ] No layout shifts or broken overflow on mobile
- [ ] TypeScript compilation passes

## Notes

- Reference designs: Supabase dashboard (clean, spacious, light shadows), Vercel dashboard (wide padding, subtle borders)
- Do not change any functional logic in these files — only className modifications
- If `src/app/layout.tsx` currently has a simple structure, just add the wrapper classes to the `<main>` element
