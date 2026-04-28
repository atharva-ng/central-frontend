import { cn } from "@/lib/utils"

export type Funnel = "TOFU" | "MOFU" | "BOFU"

const STYLES: Record<Funnel, string> = {
  TOFU: "border-chart-1/40 bg-chart-1/10 text-chart-3",
  MOFU: "border-primary/30 bg-primary/10 text-primary",
  BOFU: "border-foreground/30 bg-foreground/5 text-foreground",
}

export function FunnelBadge({ funnel, className }: { funnel: Funnel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium tracking-widest",
        STYLES[funnel],
        className
      )}
    >
      {funnel}
    </span>
  )
}
