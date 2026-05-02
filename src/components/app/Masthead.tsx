import { cn } from "@/lib/utils"
import { IndexlyLogo } from "./IndexlyLogo"

interface MastheadProps {
  phase: string
  step?: string
  className?: string
}

export function Masthead({ phase, step, className }: MastheadProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2.5">
        <div className="size-2 rounded-full bg-primary shrink-0" />
        <span className="text-sm font-medium tracking-tight">{phase}</span>
        {step && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-[11px] tabular-nums tracking-widest text-muted-foreground">
              {step}
            </span>
          </>
        )}
      </div>
      <IndexlyLogo />
    </div>
  )
}
