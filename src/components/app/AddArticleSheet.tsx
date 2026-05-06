"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Search } from "lucide-react"
import { addDays, format, isBefore } from "date-fns"
import { Button, Calendar, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, Skeleton } from "@/components/ui"
import { SectionLede } from "@/components/app/SectionLede"
import { ARTICLE_TYPES, formatShortDate, type Article } from "@/lib/articles"
import { useKeywordData, toCluster } from "@/lib/api/client"
import type { Funnel } from "@/constants"
import { cn } from "@/lib/utils"

interface PickerKeyword {
  keyword: string
  cluster: string
  funnel: Funnel
  volume: number
  difficulty: number
  cpc: number
}

interface AddArticleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (article: Article) => void
  /** When set, creation defaults to this day (e.g. user clicked "+" on a day column). */
  defaultDate?: string
}

export function AddArticleSheet({ open, onOpenChange, onCreate, defaultDate }: AddArticleSheetProps) {
  const keywordData = useKeywordData()
  const [keyword, setKeyword] = useState<PickerKeyword | null>(null)
  const [search, setSearch] = useState("")
  const [type, setType] = useState<string>(ARTICLE_TYPES[0])
  const minDate = addDays(new Date(), 1)
  const [date, setDate] = useState<Date | undefined>(
    defaultDate ? new Date(defaultDate + "T00:00:00") : addDays(new Date(), 2)
  )

  const allKeywords = useMemo<PickerKeyword[]>(() => {
    if (keywordData.kind !== "ready") return []
    return keywordData.data.clusters.flatMap((raw) => {
      const cluster = toCluster(raw)
      const all = [cluster.pillar, ...cluster.supporting]
      return all.map((k) => ({
        keyword: k.keyword,
        cluster: cluster.name,
        funnel: k.funnel,
        volume: k.volume ?? 0,
        difficulty: k.difficulty ?? 0,
        cpc: k.cpc ?? 0,
      }))
    })
  }, [keywordData])

  const filtered = allKeywords.filter((k) =>
    k.keyword.toLowerCase().includes(search.toLowerCase()) ||
    k.cluster.toLowerCase().includes(search.toLowerCase())
  )

  function handleClose(next: boolean) {
    if (!next) {
      setKeyword(null)
      setSearch("")
      setType(ARTICLE_TYPES[0])
      setDate(defaultDate ? new Date(defaultDate + "T00:00:00") : addDays(new Date(), 2))
    }
    onOpenChange(next)
  }

  function handleCreate() {
    if (!keyword || !date) return
    const newArticle: Article = {
      id: `art_${Math.random().toString(36).slice(2, 8)}`,
      title: `${keyword.keyword.replace(/\b\w/g, (c) => c.toUpperCase())}: ${type}`,
      keyword: keyword.keyword,
      funnel: keyword.funnel,
      volume: keyword.volume,
      difficulty: keyword.difficulty,
      cpc: keyword.cpc,
      type,
      status: "scheduled",
      scheduledFor: format(date, "yyyy-MM-dd"),
    }
    onCreate(newArticle)
    handleClose(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-[480px] flex flex-col p-0 gap-0">
        <SheetHeader className="border-b border-border px-6 py-5 gap-1">
          <SheetTitle className="text-base">Schedule a new article</SheetTitle>
          <SheetDescription className="text-xs">
            Pick a keyword from your queue, choose a date, and we&apos;ll add it to the schedule.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">

          {/* Keyword picker */}
          <section className="flex flex-col gap-3">
            <SectionLede number="01" label="Pick a keyword" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your keyword queue…"
                className="pl-9"
                disabled={keywordData.kind === "loading"}
              />
            </div>

            {keywordData.kind === "loading" && (
              <div className="flex flex-col gap-2 pt-1">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-4/5" />
              </div>
            )}

            {(keywordData.kind === "missing-web-entity" || keywordData.kind === "not-ready") && (
              <p className="text-xs text-muted-foreground py-4">
                {keywordData.kind === "not-ready"
                  ? "Your keyword strategy is still being built — check back in a moment."
                  : "No keyword strategy yet. Finish onboarding to generate keywords."}
              </p>
            )}

            {keywordData.kind === "error" && (
              <p className="text-xs text-muted-foreground py-4">{keywordData.message}</p>
            )}

            {keywordData.kind === "ready" && (
              <div className="flex flex-col max-h-72 overflow-y-auto -mx-1">
                {filtered.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 px-1">No keywords match.</p>
                )}
                {filtered.map((k) => {
                  const selected = keyword?.keyword === k.keyword
                  return (
                    <button
                      key={k.keyword}
                      type="button"
                      onClick={() => setKeyword(k)}
                      className={cn(
                        "flex flex-col gap-1 text-left px-3 py-2.5 rounded-md border transition-colors",
                        selected
                          ? "border-foreground bg-card"
                          : "border-transparent hover:bg-muted/50 border-b-border last:border-b-transparent rounded-none"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs">{k.keyword}</span>
                        <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                          {k.funnel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
                        <span>{k.cluster}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{k.volume.toLocaleString()} vol</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>KD {k.difficulty}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Type */}
          <section className="flex flex-col gap-3">
            <SectionLede number="02" label="Article type" />
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Date */}
          <section className="flex flex-col gap-3">
            <SectionLede number="03" label="Schedule for" />
            <Popover>
              <PopoverTrigger className="w-fit inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 transition-colors">
                <CalendarDays className="size-4" />
                {date ? formatShortDate(date.toISOString().slice(0, 10)) : "Pick a date"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => isBefore(d, minDate)}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-[11px] text-muted-foreground">
              Earliest date is tomorrow — we need 24h to research and write.
            </p>
          </section>
        </div>

        <SheetFooter className="border-t border-border px-6 py-4 flex-row justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!keyword || !date}>
            Add to schedule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
