# Blog Engine — Claude Instructions

## App
SaaS blog generation engine. Users paste a URL, the system analyzes their business, builds a keyword strategy, and auto-generates SEO blog articles. Name: to be set (placeholder: BlogEngine).

## Stack
- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 + shadcn base-nova style using `@base-ui/react`
- Clerk for authentication (hosted pages only — no custom auth UI)
- Path alias: `@/*` → `src/*`

## Key Rules
- Read `/docs/FRONTEND_RULES.md` before any UI work
- Read `/docs/SCREENS.md` to understand the screen inventory
- All screens are UI-only — data is dummy/static
- Follow the shadcn base-nova preset for all visual decisions
- Use Clerk hosted pages — never build custom sign-in/sign-up UI
- Mark screens complete in `/docs/SCREENS.md` as they are built

## Docs
- `/docs/FRONTEND_RULES.md` — visual and pattern rules
- `/docs/SCREENS.md` — screen inventory with paths and build status
