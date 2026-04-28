interface SectionLedeProps {
  number: string
  label: string
  className?: string
}

export function SectionLede({ number, label, className }: SectionLedeProps) {
  return (
    <div className={"flex items-baseline gap-3 " + (className ?? "")}>
      <span className="font-mono text-[11px] tabular-nums text-primary tracking-widest">
        {number}
      </span>
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
