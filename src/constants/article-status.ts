/**
 * Article lifecycle statuses. Wire format mirrors the backend
 * `models.ScheduledArticleStatus` string labels so the API response can be
 * used directly without an enum translation layer.
 */
export const ARTICLE_STATUSES = [
  "scheduled",
  "generating",
  "readyForReview",
  "draft",
  "published",
  // `error` is a wire-only label the backend derives when the linked
  // WebEntityMasterContext is in CGEStatusError. The article doc itself
  // stays at `generating` — a successful retry flips this row back to
  // `generating` automatically without any explicit status write.
  "error",
] as const

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number]

export const ARTICLE_STATUS_STYLES: Record<
  ArticleStatus,
  { label: string; className: string; dot: string }
> = {
  readyForReview: {
    label: "Ready for review",
    className: "border-primary/30 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  scheduled: {
    label: "Scheduled",
    className: "border-border bg-card text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  generating: {
    label: "Generating",
    className: "border-foreground/20 bg-muted text-foreground",
    dot: "bg-foreground animate-pulse",
  },
  published: {
    label: "Published",
    className: "border-chart-2/40 bg-chart-2/10 text-chart-3",
    dot: "bg-chart-3",
  },
  draft: {
    label: "Draft",
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
  error: {
    label: "Error",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

export const ARTICLE_FILTERS = [
  { id: "all", label: "All" },
  { id: "readyForReview", label: "Ready for review" },
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "generating", label: "Generating" },
  { id: "error", label: "Error" },
] as const

export type ArticleFilterId = (typeof ARTICLE_FILTERS)[number]["id"]
