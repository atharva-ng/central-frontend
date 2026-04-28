import { cn } from "@/lib/utils"

export function IndexlyLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-serif italic text-base tracking-tight",
        className
      )}
    >
      <span>indexly</span>
      <span className="text-primary not-italic font-sans text-[10px] -translate-y-0.5">●</span>
    </span>
  )
}

export function IndexlyMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-7 rounded-md bg-foreground text-background font-serif italic text-sm",
        className
      )}
    >
      ix
    </span>
  )
}
