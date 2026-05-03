import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

interface TopbarProps {
  title: string
  action?: React.ReactNode
  back?: { label: string; href: string }
}

export function Topbar({ title, action, back }: TopbarProps) {
  return (
    <header className="h-14 border-b border-border shrink-0 bg-background/85 backdrop-blur flex items-center justify-between px-6 gap-4">
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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="size-3.5" />
            Generate now
          </Link>
        )}
      </div>
    </header>
  )
}
