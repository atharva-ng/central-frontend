import { cn } from "@/lib/utils"

export function IndexlyLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 select-none",
        className
      )}
    >
      <span className="text-[18px] font-semibold tracking-[-0.03em] leading-none text-foreground">
        indexly
      </span>
      <span className="size-[5px] rounded-full bg-primary translate-y-[-1px] shrink-0" />
    </span>
  )
}

export function IndexlyMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-[28px] rounded-[7px] bg-foreground shrink-0",
        className
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className="size-[14px]"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="3.25" r="1.75" className="fill-primary" />
        <rect
          x="6.75"
          y="6.25"
          width="2.5"
          height="6.75"
          rx="1.25"
          className="fill-background"
        />
      </svg>
    </span>
  )
}
