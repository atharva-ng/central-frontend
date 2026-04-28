---
name: interface-design
description: Crafted interface design for dashboards, admin panels, and SaaS tools. Use when designing UI to escape generic AI defaults via intent-first questions, domain exploration, and consistent depth/spacing/typography systems.
---

# Interface Design

Guides crafted interface design for dashboards, admin panels, and SaaS tools — explicitly excluding marketing design.

## Core Problem

AI-generated interfaces default to generic patterns. **"The moment you stop asking 'why this?' is the moment defaults take over."**

## Required Foundation: Intent First

Before any code, answer three questions with specificity:

1. **Who is this human?** (Actual context, not generic "users")
2. **What must they accomplish?** (Specific verb, not vague tasks)
3. **What should this feel like?** (Precise descriptors, not "clean and modern")

## Product Domain Exploration

Four mandatory outputs precede any visual direction:

- **Domain:** 5+ concepts/vocabulary from the product's actual world
- **Color world:** 5+ colors naturally occurring in that domain's physical space
- **Signature:** One element visually/structurally unique to THIS product
- **Defaults:** Three obvious choices to consciously reject

**"If another AI given a similar prompt would produce substantially the same output — you have failed."**

## Craft Foundations

### Subtle Layering
Surfaces stack with whisper-quiet elevation shifts. Sidebars share canvas background (separated by subtle borders), dropdowns sit one level above parents, inputs appear inset.

### Borders
Disappear when not examined but organize structure when needed. Low-opacity rgba blends with backgrounds.

### Color Strategy
**"Your palette should feel like it came FROM somewhere — not like it was applied TO something."** Colors trace to primitives. Color carries meaning; unmotivated color is noise.

### Spacing
Multiples of a base unit across micro (icons), component (buttons/cards), section (groups), major (distinct areas). Randomness signals no system.

### Typography
Distinct levels through size, weight, AND letter-spacing combined — not size alone. Data needs monospace with tabular spacing.

### Depth Strategy
Choose ONE consistently:
- Borders-only (technical, dense tools)
- Subtle shadows (approachable)
- Layered shadows (premium)
- Surface color shifts (hierarchy via tint)

## Mandatory Checkpoints

- **Swap test:** Would changing typeface or layout to defaults feel different?
- **Squint test:** Can hierarchy still emerge when blurred?
- **Signature test:** Five specific elements where your signature appears?
- **Token test:** Do CSS variables sound like they belong to THIS product's world?

## Workflow

1. Explore domain
2. Propose direction referencing all four exploration outputs
3. Confirm direction
4. Build while maintaining intent
5. Evaluate against mandate before showing
6. Save patterns to `.interface-design/system.md`

**"Be invisible. Don't announce modes or narrate process."**
