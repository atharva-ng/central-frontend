import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { cn } from "@/lib/utils"

const TOOLTIP_TEXT =
  "Calculated from search volume, user intent, keyword difficulty (KD), your domain authority, and competition-gap analysis. Higher = stronger ranking opportunity for your site."

export type OpportunityScoreSize = "sm" | "md" | "lg"

export function OpportunityScore({
  value,
  size = "md",
  showInfo = true,
  className,
}: {
  value: number
  size?: OpportunityScoreSize
  showInfo?: boolean
  className?: string
}) {
  const tone =
    value >= 60
      ? "text-chart-3"
      : value >= 45
        ? "text-primary"
        : "text-muted-foreground"

  const numberClass =
    size === "lg"
      ? "font-mono text-3xl font-medium tabular-nums tracking-tight"
      : size === "sm"
        ? "font-mono text-[11px] tabular-nums"
        : "font-mono text-sm tabular-nums"

  const suffixClass =
    size === "lg"
      ? "text-xs text-muted-foreground/70"
      : "text-[10px] text-muted-foreground/70"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn(
                "inline-flex items-baseline gap-1 cursor-help",
                className
              )}
              tabIndex={0}
            />
          }
        >
          <span className={cn(numberClass, tone)}>{Math.round(value)}</span>
          <span className={suffixClass}>/ 100</span>
          {showInfo && size !== "sm" && (
            <Info className="size-3 text-muted-foreground/50 self-center ml-0.5" />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
          {TOOLTIP_TEXT}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
