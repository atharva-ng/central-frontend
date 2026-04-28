import { IndexlyLogo } from "./IndexlyLogo"

interface MastheadProps {
  phase: string
  step?: string
}

export function Masthead({ phase, step }: MastheadProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="size-2 rounded-full bg-primary" />
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
