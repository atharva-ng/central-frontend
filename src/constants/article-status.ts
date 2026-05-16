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
}

export const ARTICLE_FILTERS = [
  { id: "all", label: "All" },
  { id: "readyForReview", label: "Ready for review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "generating", label: "Generating" },
] as const

export type ArticleFilterId = (typeof ARTICLE_FILTERS)[number]["id"]
