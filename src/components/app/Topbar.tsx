import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopbarProps {
  title: string
  action?: React.ReactNode
  back?: { label: string; href: string }
}

export function Topbar({ title, action, back }: TopbarProps) {
  return (
    <header className="h-14 border-b border-border sticky top-0 bg-background/85 backdrop-blur z-20 flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {back.label}
          </Link>
        )}
        <h1 className="text-lg font-semibold tracking-tight truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action ?? (
          <Button size="sm" className="group">
            <Sparkles className="size-3.5" />
            Generate now
          </Button>
        )}
      </div>
    </header>
  )
}
