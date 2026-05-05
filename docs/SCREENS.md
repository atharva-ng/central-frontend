# Screen Inventory

All routes in the app. Update status as screens are built.

| # | Screen | Route | Status |
|---|--------|-------|--------|
| 1 | Auth — Sign In | `/sign-in` (Clerk hosted) | ✅ Done |
| 2 | Auth — Sign Up | `/sign-up` (Clerk hosted) | ✅ Done |
| 3 | Onboarding Step 1 — URL Input | `/onboarding` | ✅ Done |
| 4 | Onboarding Step 2 — Analysis Progress | `/onboarding/analyzing` | ✅ Done |
| 5 | Onboarding Step 3 — Business Profile Review | `/onboarding/profile` | ✅ Done |
| 6 | Onboarding Step 4 — Publishing Setup | `/onboarding/publishing` | ✅ Done |
| 7 | Onboarding Step 5 — Strategy Building Progress | `/onboarding/strategy` | ✅ Done |
| 8 | Dashboard — Schedule (home) | `/(dashboard)/dashboard` | ✅ Done |
| 8a | Dashboard — Edit Article Sheet (status-aware) | `/(dashboard)/dashboard` (drawer) | ✅ Done |
| 8b | Dashboard — Add Article Sheet | `/(dashboard)/dashboard` (drawer) | ✅ Done |
| 8c | Dashboard — Week nav + Drag-to-reschedule | `/(dashboard)/dashboard` | ✅ Done |
| 9 | Edit drawer — Keyword Swap Dialog | nested in Edit Article Sheet | ✅ Done |
| 10 | Article Review (legacy v1) | `/(dashboard)/articles/[id]` | ♻️ Replaced by Screen 12 |
| 11 | Keywords — Cluster + queue view | `/(dashboard)/keywords` | ✅ Done |
| 11a | Keywords — Add Keyword Dialog (8 states + plan cap) | nested on Keywords | ✅ Done |
| 12 | Article Review + Editor (Tiptap) | `/(dashboard)/articles/[id]` | ✅ Done |
| 12a | Articles list — filterable table | `/(dashboard)/articles` | ✅ Done |
| 13 | Settings | `/(dashboard)/settings` | ✅ Done |

## Status Key
- ✅ Done
- ⏳ In Progress
- 🔲 Not Started

## Notes
- Auth routes (`/sign-in`, `/sign-up`) are Clerk hosted pages — route files return `null`
- All onboarding routes are under `/onboarding/*` — no sidebar, no nav
- Dashboard routes are under `/(dashboard)/*` — protected by Clerk middleware, use shared sidebar layout
- `/(dashboard)` is a route group — does not appear in the URL
