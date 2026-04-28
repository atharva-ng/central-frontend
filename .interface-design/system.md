# BlogEngine — Interface Design System

## Intent

- **Who:** SaaS founders and content marketers who've tried 2-3 SEO tools and felt overwhelmed. They want one that reads like it's been thinking, not bossing them around.
- **What:** Onboard from URL → confidence in the strategy in under 5 minutes.
- **Feel:** Editorial confidence. Like a senior consultant walking through a proposal — calm authority, not a wizard.

## Domain Exploration

- **Vocabulary:** masthead, lede, byline, dispatch, plate, archive, gutter, kerning, signal-to-noise, dateline
- **Color world:** newsroom — deep ink, off-white paper, marigold/saffron highlighter, faded ledger blue, oxidized copper
- **Signature:** Numbered editorial section ledes (`01 ────── BUSINESS`) — every form section opens with a small mono number, a hairline rule, and an uppercase tracked label. Pages read top-to-bottom like a structured spread, not a wizard with cards.
- **Defaults rejected:**
  1. Stacked rounded-card boxes with `p-6` padding (generic SaaS)
  2. Centered split-card auth (login-04 style)
  3. Default colored badges/pills with solid backgrounds

## Preset

- shadcn `base-maia`, base color `mist`
- Primary: warm amber (`oklch(0.555 0.163 48.998)`) — used sparingly as accent, never in large fills
- Font sans: Inter (`--font-sans`)
- Font mono: Geist Mono (`--font-mono`) — used for numbers, domain names, section numbers, status pills

## Depth Strategy

**Borders-only.** No drop shadows. Hierarchy via:
- Hairline borders (`border-border`)
- `border-t/border-b` dividers between rows (replaces card boxes)
- Subtle bg shifts (`bg-card` vs `bg-background`) only when necessary
- Left rule (`border-l-2 border-primary`) for conditional/nested content

## Spacing Scale

4px base. Allowed steps: `1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12`.

- Section gap: `gap-12` (between numbered sections)
- Block gap: `gap-5` (within a section)
- Field gap: `gap-1.5` (label to input)
- Page padding: `px-6 py-12`
- Card padding: `p-4` (NOT p-6 — too much)
- Page max-widths: `max-w-md` (auth, simple onboarding), `max-w-xl` (publishing), `max-w-2xl` (profile)

## Typography

- **H1 lede:** `text-[28px] leading-[1.15] font-medium tracking-tight` — single sentence, period at end
- **Body:** `text-sm leading-relaxed text-muted-foreground`
- **Field label:** `text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground`
- **Section lede label:** `text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground`
- **Section number:** `font-mono text-[11px] tabular-nums tracking-widest text-primary`
- **Hint:** `text-[11px] text-muted-foreground/70`
- **Domain/data:** `font-mono` — always monospace for domains, IDs, step counters
- **Big number (counters):** `font-mono text-4xl tabular-nums tracking-tight`

## Signature Patterns

### Masthead (every page)
```
● BlogEngine                        STEP 01 / 02
```
- size-2 primary dot, brand text, mono step counter right-aligned

### Section Lede
```
01 ──────────────── BUSINESS
```
- mono number + hairline rule fill + tracked uppercase label
- Component: `<SectionLede number="01" label="Business" />`

### Sentence-style headings
H1 ends with a period. Lowercase title-style. e.g. "Where do articles go?"

### Lists not cards
Repeating items use `border-t border-border last:border-b` row dividers — never individual cards.

### Bordered pill chips
Tags/badges use `border border-border bg-card rounded-full` with a leading 1px primary dot. Never solid backgrounds.

### Underline-on-focus inputs (auth/onboarding step 1)
First-impression inputs use `border-0 border-b border-border` with `focus-within:border-foreground` — feels typed, not boxed.

### Numbered competitor list
Each competitor row is prefixed with mono `01`, `02`, `03` — references same numbering as section ledes.

## Constraints

- Max 3 competitors (keyword overlap analysis is sharper with focused set)
- Country dropdown shows full list, capped scroll height `max-h-72`
- CTA arrows animate `translate-x-0.5` on hover (group/group-hover)

## Mandatory Checkpoints (passed)

- **Swap test:** Replace section ledes with plain h2s and the editorial feel collapses → confirms signature is load-bearing
- **Squint test:** Hairline rules + numbered prefixes preserve hierarchy when blurred
- **Signature test:** 5 places where editorial signature appears: masthead step counter, section ledes, mono domain links, numbered competitor rows, mono big-number counter on analyzing page
- **Token test:** "masthead", "lede", "dispatch" — vocabulary borrowed directly from newsrooms
