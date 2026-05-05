import { cn } from "@/lib/utils"
import { ARTICLE_STATUS_STYLES, type ArticleStatus } from "@/constants/article-status"

export type { ArticleStatus }

export function StatusBadge({
  status,
  label,
}: {
  status: ArticleStatus
  /** Override the default label for the status (e.g. "Generated" instead of "Ready for review"). */
  label?: string
}) {
  const s = ARTICLE_STATUS_STYLES[status]
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
