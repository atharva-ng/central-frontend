"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from "@/components/ui"
import { FunnelBadge, type Funnel } from "@/components/app/FunnelBadge"
import { FUNNEL_FILTER_OPTIONS, type FunnelFilter } from "@/constants"
import { cn } from "@/lib/utils"

interface SwapKeyword {
  keyword: string
  cluster: string
  funnel: Funnel
  volume: number
  difficulty: number
}

const POOL: SwapKeyword[] = [
  { keyword: "sync salesforce to google sheets", cluster: "salesforce-sheets", funnel: "BOFU", volume: 590, difficulty: 19 },
  { keyword: "export salesforce reports to google sheets", cluster: "salesforce-sheets", funnel: "BOFU", volume: 480, difficulty: 17 },
  { keyword: "coefficient alternatives", cluster: "alternatives", funnel: "MOFU", volume: 880, difficulty: 29 },
  { keyword: "best google sheets add-ons for data", cluster: "alternatives", funnel: "MOFU", volume: 2100, difficulty: 30 },
  { keyword: "zapier alternatives for google sheets", cluster: "alternatives", funnel: "MOFU", volume: 720, difficulty: 27 },
  { keyword: "google sheets for sales reporting", cluster: "use-case-sales", funnel: "MOFU", volume: 590, difficulty: 22 },
  { keyword: "what is a data connector for google sheets", cluster: "sheets-automation", funnel: "TOFU", volume: 390, difficulty: 14 },
  { keyword: "how to sync data to google sheets automatically", cluster: "sheets-automation", funnel: "TOFU", volume: 880, difficulty: 24 },
  { keyword: "pull stripe data into google sheets", cluster: "stripe-sheets", funnel: "BOFU", volume: 320, difficulty: 18 },
  { keyword: "connect shopify to google sheets", cluster: "shopify-sheets", funnel: "BOFU", volume: 480, difficulty: 21 },
]

const FILTERS: readonly FunnelFilter[] = FUNNEL_FILTER_OPTIONS

interface KeywordSwapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recommendedFunnel?: Funnel
  onSwap?: (keyword: string) => void
}

export function KeywordSwapDialog({
  open,
  onOpenChange,
  recommendedFunnel,
  onSwap,
}: KeywordSwapDialogProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FunnelFilter>("All")
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return POOL.filter((k) => {
      if (filter !== "All" && k.funnel !== filter) return false
      if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [filter, search])

  function reset() {
    setSearch("")
    setFilter("All")
    setSelected(null)
  }

  function handleClose(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleConfirm() {
    if (!selected) return
    onSwap?.(selected)
    toast("Keyword updated — title regenerating…")
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Change keyword</DialogTitle>
          <DialogDescription className="text-sm">
            Pick a different keyword from your queue. Same funnel stage recommended
            to keep your schedule balanced.
            {recommendedFunnel && (
              <> Currently <span className="font-mono text-foreground">{recommendedFunnel}</span>.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 flex flex-col gap-3 border-b border-border">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords…"
              className="pl-9"
            />
          </div>

          {/* Filter segmented control */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-card w-fit">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 h-7 rounded-full text-[11px] font-medium tracking-tight transition-colors",
                  filter === f
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-6 py-8 text-center">
              No keywords match your filters.
            </p>
          ) : (
            <ul>
              {filtered.map((k) => {
                const isSelected = selected === k.keyword
                return (
                  <li key={k.keyword}>
                    <button
                      type="button"
                      onClick={() => setSelected(k.keyword)}
                      className={cn(
                        "w-full flex items-start justify-between gap-3 px-6 py-3 border-l-2 text-left transition-colors",
                        isSelected
                          ? "bg-accent border-l-primary"
                          : "border-l-transparent hover:bg-accent/50"
                      )}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="font-mono text-sm font-medium truncate">
                          {k.keyword}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{k.cluster}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 items-end shrink-0">
                        <FunnelBadge funnel={k.funnel} />
                        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                          Vol {k.volume.toLocaleString()} · KD {k.difficulty}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-center px-6 py-3 border-t border-border">
          Showing keywords from your queue · Can&apos;t find it?{" "}
          <span className="underline underline-offset-4">Add a custom keyword</span>{" "}
          in Keywords page
        </p>

        <DialogFooter className="px-6 py-4 border-t border-border flex-row justify-between sm:justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selected} onClick={handleConfirm}>
            Use this keyword
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
