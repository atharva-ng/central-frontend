import type { ArticleStatus } from "./article-status"

export const KEYWORD_STATUSES = ["generated", "scheduled", "queued"] as const

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
  generated: "Generated",
  scheduled: "Scheduled",
  queued: "Queued",
}

/** Keyword lifecycle status maps to a badge style on the article-status palette. */
export const KEYWORD_STATUS_TO_BADGE: Record<KeywordStatus, ArticleStatus> = {
  generated: "readyForReview",
  scheduled: "scheduled",
  queued: "draft",
}
