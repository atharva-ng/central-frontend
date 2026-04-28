import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ImagePlate({
  label = "Image",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted border border-border flex flex-col items-center justify-center gap-2 not-prose",
        className
      )}
    >
      <ImageIcon className="size-5 text-muted-foreground/60" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
