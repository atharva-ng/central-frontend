import type { ArticleStatus } from "./article-status"

// Keyword statuses on the /keywords screen mirror the ScheduledArticle
// lifecycle plus "queued" (no slot booked yet). Keeping the wire labels
// aligned with article-status means the badge palette is shared.
export const KEYWORD_STATUSES = [
  "queued",
  "scheduled",
  "generating",
  "readyForReview",
  "draft",
  "published",
  // Mirrors the wire-only "error" status the scheduled-articles read path
  // emits when the linked WebEntityMasterContext is in CGEStatusError.
  // /keywords surfaces the badge but offers no retry action — the retry
  // lives on the dashboard / articles screens.
  "error",
] as const

export type KeywordStatus = (typeof KEYWORD_STATUSES)[number]

export const VALID_KEYWORD_STATUSES: ReadonlySet<KeywordStatus> = new Set(
  KEYWORD_STATUSES,
)

export function toKeywordStatus(
  value: string,
  fallback: KeywordStatus = "queued",
): KeywordStatus {
  return VALID_KEYWORD_STATUSES.has(value as KeywordStatus)
    ? (value as KeywordStatus)
    : fallback
}

export const KEYWORD_STATUS_LABEL: Record<KeywordStatus, string> = {
  queued: "Queued",
  scheduled: "Scheduled",
  generating: "Generating",
  readyForReview: "Ready for review",
  draft: "Draft",
  published: "Published",
  error: "Error",
}

/** Keyword lifecycle status maps to a badge style on the article-status palette. */
export const KEYWORD_STATUS_TO_BADGE: Record<KeywordStatus, ArticleStatus> = {
  queued: "draft",
  scheduled: "scheduled",
  generating: "generating",
  readyForReview: "readyForReview",
  draft: "draft",
  published: "published",
  error: "error",
}
