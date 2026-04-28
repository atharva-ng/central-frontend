import { cn } from "@/lib/utils"

export type ArticleStatus =
  | "review"
  | "scheduled"
  | "generating"
  | "published"
  | "queued"
  | "draft"

const STYLES: Record<ArticleStatus, { label: string; className: string; dot: string }> = {
  review: {
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
  queued: {
    label: "Queued",
    className: "border-border bg-background text-muted-foreground",
    dot: "bg-muted-foreground/30",
  },
  draft: {
    label: "Draft",
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
}

export function StatusBadge({
  status,
  label,
}: {
  status: ArticleStatus
  /** Override the default label for the status (e.g. "Generated" instead of "Ready for review"). */
  label?: string
}) {
  const s = STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border pl-1.5 pr-2 py-0.5 text-[11px] font-medium tracking-tight",
        s.className
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {label ?? s.label}
    </span>
  )
}
