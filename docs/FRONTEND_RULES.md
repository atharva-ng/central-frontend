# Frontend Rules

## Preset
shadcn **base-maia** style with `@base-ui/react` primitives, base color **mist**.
Initialized via `npx shadcn@latest init --preset b2oqmAyPL`. Never swap to Radix.

## Design System Source of Truth
All design decisions live in [.interface-design/system.md](../.interface-design/system.md).
Read that before adding any new screen — it captures the editorial direction
(masthead, section ledes, hairline depth, mono numbering signature).

## Colors
Semantic tokens only — never raw hex/oklch/Tailwind palette classes:
- Background: `bg-background`, `bg-card`, `bg-muted`
- Text: `text-foreground`, `text-muted-foreground`
- Primary (warm amber): `bg-primary`, `text-primary` — used sparingly as accent
- Border: `border-border`
- Destructive: `bg-destructive`

## Typography
- Body font: Inter via `--font-sans`
- Mono font: Geist Mono via `--font-mono` — required for numbers, domains, step counters
- H1 lede: `text-[28px] leading-[1.15] font-medium tracking-tight`, sentence-style with period
- Body: `text-sm leading-relaxed text-muted-foreground`
- Field label: `text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground`

## Spacing & Layout
- Page padding: `px-6 py-12`
- Section gap: `gap-12` between numbered sections
- Block gap: `gap-5` within a section
- Card padding: `p-4` (never `p-6`)
- Page widths: `max-w-md` auth, `max-w-xl` publishing, `max-w-2xl` profile

## Depth
**Borders-only.** No shadows. Use hairline `border-t/border-b` row dividers
in place of stacked card boxes. Conditional content nests under
`border-l-2 border-primary`.

## Components
- Import all UI from `@/components/ui/*`
- Custom shared components in `@/components/app/*` — `SectionLede`, `AnalysisStep`, `TagInput`
- Add primitives via `npx shadcn@latest add <name>` — never hand-write

## Signature Patterns

### Masthead (every onboarding/auth page)
Use the shared component, never inline:
```tsx
<Masthead phase="Onboarding" step="01 / 02" />
```
- Left: primary dot + phase label (`Sign in`, `Sign up`, `Onboarding`, `Analyzing`, `Profile`, `Publishing`, `Building strategy`)
- Right: `<IndexlyLogo />` — italic serif lowercase wordmark with primary dot, references newspaper nameplate
- Phase replaces the previous "BlogEngine" text — never write the brand name on the left, the brand lives top-right

### Section Lede
Mono number + hairline rule + tracked uppercase label.
Component: `<SectionLede number="01" label="Business" />`

### Lists not cards
Repeating items: `border-t border-border last:border-b`. Never individual cards.

### Pill chips
`border border-border bg-card rounded-full pl-2.5 pr-1` with leading
`size-1 rounded-full bg-primary` dot. No solid-background pills.

### Mono everywhere
Domain names, step numbers (`01 / 02`), counters, IDs → `font-mono tabular-nums`.

## Patterns — Onboarding Flows
- Centered single column, `min-h-screen flex items-center justify-center`
- No sidebar, no nav
- Sentence-style H1 with period
- Subhead in `text-muted-foreground`
- CTA: full-width or right-aligned with `<ArrowRight className="size-4 group-hover:translate-x-0.5" />`

## Countries
Full ISO list lives in [src/lib/countries.ts](../src/lib/countries.ts) — import `COUNTRIES` and map.
Cap dropdown scroll with `<SelectContent className="max-h-72">`.

## Constraints
- Max 3 competitors enforced in profile screen
- Sentence-style H1s end with a period
- Auth: Google only (no Apple). Use `<GoogleIcon />` from `@/components/app/BrandIcons`
- Framer references must use `<FramerIcon />` from same file — never text "Fr"

## Dashboard Shell

### Layout
- `(dashboard)` route group with `layout.tsx` providing Sidebar + Topbar wrapper
- Sidebar (`@/components/app/Sidebar`): w-60 expanded, w-14 collapsed, persists via `localStorage` key `indexly:sidebar-collapsed`
- Topbar (`@/components/app/Topbar`): `h-14 sticky top-0 bg-background/85 backdrop-blur` with page title left and primary action right
- Page content uses `max-w-5xl mx-auto px-6 py-6`

### Sidebar
- Brand: `<IndexlyMark />` + `<IndexlyLogo />` in expanded; just mark when collapsed
- 4 nav items: Schedule (home, `/dashboard`), Keywords, Articles, Settings
- Active state: `bg-accent text-accent-foreground font-medium` + trailing `size-1 bg-primary` dot
- User: Clerk `<UserButton />` + label, separated by `border-t`
- Collapsed: rely on native `title` attribute for hover labels (do not use Tooltip — base-ui tooltips don't accept `asChild`)

### Topbar
- `<Topbar title="Schedule" />` — default action is "Generate now" with Sparkles icon
- Pass custom `action` prop to override

## Status Badges
`<StatusBadge status="review|scheduled|generating|published" />` — pill with leading dot.
- review → primary tint (warm amber)
- scheduled → muted gray
- generating → pulsing foreground dot
- published → chart-2 green

## Schedule Day Section
Day groups use the same SectionLede vocabulary:
```
24 ────── Monday, Feb 24                       2 articles
```
- Mono day number on left in primary
- Day label
- Hairline rule fills middle
- Article count tabular right
- Article rows below use `border-t border-border last:border-b` (no card boxes)

## Stats Bar
Four-up stat grid uses `grid-cols-4 gap-px bg-border` so cells share hairline dividers, with the `ready to review` column highlighted via `text-primary` on the number.

## Article Lifecycle & Lock Rules

States and what each allows:

| Status | Keyword | Type | Title | Date | Body | Drag |
|---|---|---|---|---|---|---|
| `scheduled` | edit | edit | edit | edit (≥ now+24h) | n/a (not generated yet) | ✅ |
| `generating` | locked | locked | locked | locked | locked | ✗ |
| `review` (generated) | locked | locked | edit (regenerate) | edit (reschedule) | edit (separate editor) | ✗ |
| `published` | locked | locked | locked | locked | locked | ✗ |

Helpers in [src/lib/articles.ts](../src/lib/articles.ts):
- `isMetadataLocked(a)` — true unless scheduled
- `lockMessage(a)` — human-readable awareness ("Locks in 3 days…", "Generated — edit content directly", etc.)
- `isDraggable(a)` — true only if scheduled
- `canDropOn(a, date)` — scheduled AND target leaves ≥24h before generation kicks off

The 24h buffer is the auto-generation deadline. Once an article passes it, the pipeline starts and metadata is frozen — UI surfaces this proactively via the `lockMessage` banner inside the Edit Sheet.

## Edit / Add Sheet patterns

- `<EditArticleSheet>` — status-aware:
  - Banner at top reads `lockMessage(article)`. Primary tint when scheduled (positive), muted when locked.
  - For `review`-status articles, prominent **Edit article content** CTA appears above the form (reuse this card pattern for any "open in another editor" affordance — dark-bg square icon + label + arrow).
  - For `scheduled`, a **Generate now** dashed-border CTA at bottom triggers `onGenerate` — duplicates the row dropdown action so users finding the sheet first don't have to back out.
- `<AddArticleSheet>` — keyword picker → type → date. Date min is `now + 24h`. Numbered SectionLedes (`01 / 02 / 03`) match the Edit sheet rhythm.

## Schedule Drag & Drop

Library: `@dnd-kit/core` (no sortable — between-container only).

- `DndContext` wraps the week view; each `DayColumn` is `useDroppable` keyed by ISO date; each draggable row is `useDraggable` keyed by article id.
- Drop targets are disabled when `canDropOn(article, day)` returns false → invalid days dim to `opacity-50` during drag.
- `<DragOverlay>` renders a clone of the row — a small card with status badge + title — so the original row can fade via `isDragging && opacity-30`.
- Activation: `PointerSensor` with `distance: 6` so click events on the grip don't fire spurious drags.
- Grip `<GripVertical />` only appears on draggable rows (scheduled status), and only on hover — keeps non-interactive UI calm.

Drop validation rule:
> Scheduled articles can move freely to any future day where the new date is ≥ 24h from now. Otherwise auto-generation would fire immediately.

## Week Navigation

- `weekStart` state anchored to Monday via `startOfWeek(d, { weekStartsOn: 1 })` from `date-fns`.
- Render all 7 days even if empty — empty days act as drop targets and have an inline `+ Add` button.
- Arrows shift `addWeeks(±1)`. A `Today` button appears only when off-current-week.
- "Drag scheduled rows to reschedule" hint sits in the top-right of the nav row — visible on `sm+`.

## Empty Day State
`"—"` in `text-[11px] text-muted-foreground/60 italic` per empty day. During an active drag, valid empty targets switch to `"Drop here to reschedule"`.

## Drawer / Sheet
For inline edit flows use `<Sheet>` from shadcn:
- Right-side drawer, `sm:max-w-[480px]`, `flex flex-col p-0 gap-0`
- Header has `border-b`, footer has `border-t` (sticky via flex layout, no `sticky` class needed)
- Body: numbered SectionLede sections matching onboarding rhythm — keeps editorial signature consistent across product surfaces
- Use `render` prop on base-ui primitives that need composition (e.g. PopoverTrigger). `asChild` does NOT work in base-ui

## Funnel & Status Pills

- `<FunnelBadge funnel="TOFU|MOFU|BOFU" />` — `font-mono text-[10px] tracking-widest` letters in a colored chip. Each funnel has a distinct accent: TOFU green, MOFU primary amber, BOFU foreground.
- `<StatusBadge status="..." label="..." />` now accepts a `label` override so the same pill can read "Generated", "Ready for review", "Scheduled · Mar 3", "Queued", etc. without inventing new variants.

## Segmented filter control
Pattern used in KeywordSwapDialog; reuse for any single-select horizontal filter:
```tsx
<div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card w-fit">
  {OPTIONS.map(o => (
    <button className={cn(
      "px-3 h-7 rounded-full text-[11px] font-medium",
      active === o ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
    )}>{o}</button>
  ))}
</div>
```
Ink-on-paper inversion for active — matches the editorial direction better than a primary-tinted pill.

## Selectable list pattern (Dialog, picker)
- Hover: `bg-accent/50`
- Selected: `bg-accent border-l-2 border-l-primary` (left rule signals selection like an editorial sidebar mark)
- Padding: `px-6 py-3`
- Row content: keyword/title left in `font-mono`, metadata right-aligned with FunnelBadge above, mono volume/KD below

## Article Review (split layout)
Pattern at `/(dashboard)/articles/[id]`:
- Left column flex-1 min-w-0 overflow-y-auto, max-w-3xl content centered
- Right column `w-80 shrink-0 border-l border-border` (NOT `border-r` on left — keeps the rule on the panel edge)
- Sticky toolbar inside left column at `top-14` (under topbar), bleeds outside content via `-mx-8 px-8`
- Body uses Tailwind Typography `prose prose-sm` with overrides:
  - `prose-headings:tracking-tight prose-headings:font-semibold`
  - `prose-h1:text-3xl prose-h1:leading-tight prose-h1:mb-6`
  - `prose-h2:text-xl prose-h2:mt-10`
  - `prose-p:text-foreground prose-strong:text-foreground prose-strong:font-medium`
- Image placeholders use `<ImagePlate />` with `not-prose` so prose styles don't leak into the placeholder

### Tailwind Typography
Enable in [globals.css](../src/app/globals.css) via `@plugin "@tailwindcss/typography";` (Tailwind v4 syntax — no config file). Wrap content in `<article className="prose prose-sm max-w-none">`.

### Meta assets pattern (right panel)
- Editable Input/Textarea with character counter top-right of label row
- Counter goes `text-destructive` when over the limit (60 for title, 155 for description)
- Slug input: leading `/` glyph in mono inside an inline-prefix container; input has `border-0 shadow-none` so the prefix container owns the border
- ImageRow: `<ImagePlate w-16 h-10 />` thumbnail + label + ghost "Regenerate" button, all in a flex row

## Cluster + Queue layout (Keywords page)
Pattern at `/(dashboard)/keywords`:
- Left aside `w-72 shrink-0 border-r border-border` with cluster list
- Right `flex-1 overflow-y-auto px-8 py-6` with cluster detail
- Cluster items: full-width buttons with `border-l-2` (transparent inactive, primary when active) — matches selectable-list selection mark
- Cluster pillar status indicator: small dot at end of row, green when published, amber when pending
- Pillar card: distinct from supporting via `border-primary/30 bg-primary/5` + a `PILLAR` mono caps tag
- Supporting rows: leading mono score column, then funnel + keyword + stats, status pill on the right

## Add-Keyword Dialog state machine
8-phase machine in [src/components/app/AddKeywordDialog.tsx](../src/components/app/AddKeywordDialog.tsx):

| Phase | Trigger | UI |
|---|---|---|
| `empty` | input cleared | helper hint, Add disabled |
| `typing` | keystroke | helper hint, Add disabled |
| `fetching` | 600ms after last keystroke | 3 skeleton lines + "Fetching from DataForSEO…" with spinner |
| `ready` | 1.1s after fetch start, has data | muted-bg card with Vol/KD/CPC + intent + cluster + score |
| `no-data` | lookup returns null | amber info box + "Add anyway" enabled |
| `duplicate` | keyword already in queue | destructive-tinted box + cluster/status of existing |
| `submitting` | user clicked Add | spinner in button, dialog persists for 1s |
| `cap` | usage >= 10 | separate `<PlanCapDialog />` shows lock icon + upgrade CTA |

The dialog is dumb about cap state — the **page** decides whether to open `<AddKeywordDialog />` or `<PlanCapDialog />`. Usage counter lives in topbar copy: `8 / 10 manual keywords used this month`.

`lookupKeyword(query)` and `findDuplicate(query)` in [src/lib/keywords.ts](../src/lib/keywords.ts) — `null`/duplicate triggers are deterministic (length < 4, contains "obscure"/"xyz", or matches an existing keyword in any cluster).

## Topbar back link
`<Topbar back={{ label, href }} />` renders a small chevron-left ghost link to the left of the title. Used on detail pages (e.g. Article Review). Action prop accepts a fragment so multiple buttons can sit on the right.

## Opportunity Score

`<OpportunityScore value={89} size="sm|md|lg" showInfo />` from [components/app/OpportunityScore.tsx](../src/components/app/OpportunityScore.tsx). 0–100 scale (clamped 55–95 from the lookup formula; pre-seeded cluster keywords land 65–91).

- Tone: ≥80 chart-3 (green), ≥65 primary (amber), <65 muted
- Suffix `/ 100` always rendered so the scale is implicit
- Hovering surfaces a Tooltip explaining the formula: *volume, intent, KD, your domain authority, competition-gap analysis*. Always include this — it's the single most-asked question users have about a score
- Use `size="lg"` for prominent placements (article sidebar, pillar card); `sm` for inline list rows; `md` for everything else

The score is the highlight, not just one of many stats — the score number gets its own column in the supporting list and its own dedicated section ("02 Opportunity") in the article sidebar.

## Article Editor — Toolbar & Lock states

Two pieces work together:
- `useArticleEditor({ markdown, images, editable })` hook — owns the Tiptap instance and re-renders on every transaction so toolbar buttons reflect cursor state
- `<ArticleToolbar editor={editor} />` — pill-shaped formatting toolbar with Bold / Italic / Strike / H2 / H3 / Bullet / Ordered / Quote / Link / Undo / Redo. Active state inverts (`bg-foreground text-background`) using the same ink-on-paper convention as `<SegmentedControl>`. Each `Btn` reads `editor.isActive(...)` directly.

**Lock states (no manual override needed):**
- `status === "generating"` → editor is read-only, toolbar hidden, mode forced to Preview, Save Draft + Publish replaced with a "Pipeline running" indicator, banner at top of editor explains
- `status === "published"` → editor stays editable so users can fix typos; right-side action becomes "View live" + "Republish"
- All other statuses → full edit experience

Critically: **no Regenerate-section button, no Request-rewrite action.** Both removed — they encourage destructive edits and the cost (re-running the pipeline) isn't a good MVP trade. Article-level destructive actions live behind the topbar overflow menu (currently just Delete, with Duplicate as a non-destructive sibling).

## Auto-publish awareness

For `review`-status articles, surface the auto-publish date in two places:
1. **Topbar subtitle** — `Auto-publishes Apr 28 · in 1 day` directly under the centered title. Keeps the deadline at eye-level without making users open the sidebar.
2. **Status section in sidebar** — full date + relative phrasing ("Auto-publishes Apr 28, 2026 · in 1 day") inside the centered status pill block.

Helpers: `formatAutoPublish(status)` and `humanRelative(iso)` live inline in the article page. They use `date-fns` to handle "in less than an hour" / "in N days" / "N days ago" without pulling another lib.

## Tiptap Editor

The article editor at [`components/app/ArticleEditor.tsx`](../src/components/app/ArticleEditor.tsx) wraps Tiptap with our prose styling.

**Extensions:** `StarterKit` (h1–h3 only), `Image`, `Link` (no `openOnClick`), `Placeholder`, `CharacterCount`. Add new extensions only when a real editing requirement exists; each one expands the editor schema and bug surface.

**Markdown loading:** Source content is markdown stored on the record (`article_content`). Convert with `marked.parse(md, { async: false })` before mounting. **Replace image placeholders before parsing** — the markdown contains `{{IMAGE_THUMBNAIL}}` / `{{IMAGE_MID_ARTICLE}}` tokens that map to entries in the `images[]` array.

**Empty `s3_key`:** Tiptap's StarterKit schema strips unknown block elements. To survive a "still generating" state, replace the token with a `<p data-placeholder-image="...">` — paragraphs are always allowed by the schema. The editor's `editorProps.attributes.class` then styles `[&_[data-placeholder-image]]` into a dashed muted box. Don't try to inject a `<div>` — it will be silently stripped on the next change.

**SSR:** Tiptap requires a client-only mount. Always:
- Mark the editor component `"use client"`
- Pass `immediatelyRender: false` to `useEditor` to avoid hydration mismatches
- Drive `editable` via `editor.setEditable(...)` in a `useEffect` so the same editor instance survives Edit ↔ Preview toggles (re-mounting loses cursor state)

**Prose styling:** apply Tailwind Typography classes via `editorProps.attributes.class`. Reuse the same overrides as the static `prose` block (h1 `text-3xl`, h2 `text-xl mt-10`, foreground paragraph color, etc.) so editor and preview look identical.

## Article Review (Screen 12) layout

`/(dashboard)/articles/[id]` ditches the shared `<Topbar>` for a 3-section header — back link left, **truncated title centered** (`text-sm font-medium truncate max-w-sm mx-auto`), actions right. Use this pattern for any other "deep page where the title is long enough to need its own row".

Right panel is `w-[340px] bg-card` (was `w-80` in the legacy version). Sections numbered 01 → 07 each render via a local `Section` helper that emits the same SectionLede vocabulary as the rest of the app — keeps the editorial signature consistent inside the metadata sidebar.

**Status footnote pattern:** under the centered StatusBadge, render context-specific microcopy (publish date + live URL, scheduled date with calendar glyph, generated date) instead of forcing one-size-fits-all metadata.

## Schema Collapsibles

`Article schema` and `FAQ schema` use shadcn `Collapsible`. Trigger row layout:
- Lucide `<FileJson />` glyph
- Title (text)
- Right-side status pill: green dot + "Generated", or amber + "Pending"
- Trailing `<ChevronDown>` that rotates 180° via `group-data-[panel-open]:rotate-180` (base-ui exposes `data-panel-open` on the trigger element)

Content area: `pre` block with `font-mono text-[11px]` over `bg-muted/40`, copy button absolute top-right.

## Articles list (Screen 12a)

`/(dashboard)/articles` uses **plain CSS grid rows**, not `tanstack/react-table`. Columns are defined once in a header row and reused per data row via `grid-cols-[1fr_180px_140px_70px_80px_140px_120px_90px]`. Hover row reveals action icons via `opacity-0 group-hover:opacity-100`.

Tabs use shadcn `<Tabs>` directly with our existing accent — TabsList styling comes from the preset. We render every TabsContent panel up-front (each filtering the same `ARTICLES` array) rather than lifting state into the page.

Empty state: dashed-border card with Lucide icon + heading + helper + recovery CTA.

## Stacking dialogs over sheets
`KeywordSwapDialog` is rendered **inside** `<Sheet>`'s tree (after `<SheetContent>`). Base-UI portals each layer correctly, so no manual z-index management needed. Pattern: nested editing flows live inside their parent surface's component tree, not at the page level.

## Base-UI API gotchas
- No `asChild` — use `render={<Element />}` on primitives, or style the trigger directly
- `Select.onValueChange` signature is `(value: string | null) => void` — guard with `(v) => v && setX(v)`
- `TooltipProvider` does not accept `delayDuration`
- Clerk `UserButton` props: do NOT use `afterSignOutUrl` — drop it
