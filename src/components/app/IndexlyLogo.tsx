import { cn } from "@/lib/utils"

export function IndexlyLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      <span className="font-serif italic text-[17px] leading-none tracking-tight text-foreground">
        indexly
      </span>
      <span className="size-[5px] rounded-full bg-primary shrink-0" />
    </span>
  )
}

export function IndexlyMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-[26px] rounded-[5px] bg-foreground text-background font-serif italic text-[13px] leading-none font-medium select-none shrink-0",
        className
      )}
    >
      ix
    </span>
  )
}
