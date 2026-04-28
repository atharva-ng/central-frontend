import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type StepState = "pending" | "active" | "done"

interface AnalysisStepProps {
  number: string
  label: string
  state: StepState
}

export function AnalysisStep({ number, label, state }: AnalysisStepProps) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <span
        className={cn(
          "font-mono text-[11px] tabular-nums tracking-widest w-6",
          state === "done" && "text-primary",
          state === "active" && "text-foreground",
          state === "pending" && "text-muted-foreground/50"
        )}
      >
        {number}
      </span>

      <div className="shrink-0 size-4 flex items-center justify-center">
        {state === "done" && (
          <Check className="size-3.5 text-primary" strokeWidth={2.5} />
        )}
        {state === "active" && (
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        )}
        {state === "pending" && (
          <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        )}
      </div>

      <span
        className={cn(
          "text-sm flex-1",
          state === "done" && "text-muted-foreground line-through decoration-muted-foreground/30",
          state === "active" && "text-foreground font-medium",
          state === "pending" && "text-muted-foreground/60"
        )}
      >
        {label}
      </span>
    </div>
  )
}
