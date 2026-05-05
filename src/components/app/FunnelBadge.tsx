import { cn } from "@/lib/utils"
import { FUNNEL_BADGE_CLASS, type Funnel } from "@/constants"

export type { Funnel }

export function FunnelBadge({ funnel, className }: { funnel: Funnel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium tracking-widest",
        FUNNEL_BADGE_CLASS[funnel],
        className
      )}
    >
      {funnel}
    </span>
  )
}
