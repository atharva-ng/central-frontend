import { cn } from "@/lib/utils"

interface SegmentedControlProps<T extends string> {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  className?: string
  size?: "sm" | "md"
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card w-fit",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full font-medium tracking-tight transition-colors",
            size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-7 px-3 text-[11px]",
            value === opt
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
