"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Lock, PencilLine, RotateCcw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { addDays, isBefore } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { SectionLede } from "@/components/app/SectionLede"
import { KeywordSwapDialog } from "@/components/app/KeywordSwapDialog"
import {
  ARTICLE_TYPES,
  formatShortDate,
  isMetadataLocked,
  lockMessage,
  type Article,
} from "@/lib/articles"
import { cn } from "@/lib/utils"

interface EditArticleSheetProps {
  article: Article | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (article: Article) => void
  onGenerate?: (article: Article) => void
}

const TITLE_ALTERNATIVES = [
  "Salesforce to Google Sheets: 4 Methods for Sales Ops Teams",
  "How to Connect Salesforce to Google Sheets (2025 Guide)",
  "Stop Exporting CSVs: Live Salesforce Data in Google Sheets",
  "Salesforce Google Sheets Integration: Complete Comparison",
]

export function EditArticleSheet({
  article,
  open,
  onOpenChange,
  onSave,
  onGenerate,
}: EditArticleSheetProps) {
  const [title, setTitle] = useState("")
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [type, setType] = useState<string>(ARTICLE_TYPES[0])
  const [date, setDate] = useState<Date | undefined>()
  const [instructions, setInstructions] = useState("")
  const [swapOpen, setSwapOpen] = useState(false)
  const [keyword, setKeyword] = useState("")

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setType(article.type)
      setDate(new Date(article.scheduledFor + "T00:00:00"))
      setShowAlternatives(false)
      setInstructions("")
      setKeyword(article.keyword)
    }
  }, [article])

  if (!article) {
    return <Sheet open={open} onOpenChange={onOpenChange} />
  }

  const locked = isMetadataLocked(article)
  const isGenerated = article.status === "review"
  const isPublished = article.status === "published"
  const isScheduled = article.status === "scheduled"

  // Date picker can't go below "tomorrow + 1d" (24h lock buffer) for scheduled rows
  const minPickable = addDays(new Date(), 1)
  function dateDisabled(d: Date) {
    if (!isScheduled) return true // generated/published/generating dates are read-only
    return isBefore(d, minPickable)
  }

  function pickAlternative(t: string) {
    setTitle(t)
    setShowAlternatives(false)
  }

  function handleSave() {
    if (!article || !date) return
    const updated: Article = {
      ...article,
      title,
      type: locked ? article.type : type,
      keyword,
      scheduledFor: date.toISOString().slice(0, 10),
    }
    onSave?.(updated)
    toast(isGenerated ? "Title and date updated" : "Changes saved")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] flex flex-col p-0 gap-0">
        <SheetHeader className="border-b border-border px-6 py-5 gap-1">
          <SheetTitle className="text-base">
            {isGenerated ? "Review article" : isPublished ? "Article details" : "Edit article"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {isGenerated
              ? "Generated — keyword and type are locked. Edit the body or regenerate the title."
              : isPublished
                ? "This article is live. View only."
                : "Tune the brief before generation runs."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">

          {/* Lock awareness banner */}
          <div
            className={cn(
              "flex items-start gap-3 rounded-md border p-3",
              isScheduled
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-muted/40"
            )}
          >
            {isScheduled ? (
              <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
            ) : (
              <Lock className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <p className={cn(
              "text-xs leading-relaxed",
              isScheduled ? "text-foreground" : "text-muted-foreground"
            )}>
              {lockMessage(article)}
            </p>
          </div>

          {/* Generated → prominent Edit content CTA */}
          {isGenerated && (
            <button
              type="button"
              onClick={() => toast("Article editor coming in next screen")}
              className="group flex items-center justify-between gap-3 rounded-md border border-foreground/20 bg-card hover:bg-muted/40 transition-colors px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-md bg-foreground text-background flex items-center justify-center">
                  <PencilLine className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Edit article content</span>
                  <span className="text-[11px] text-muted-foreground">
                    Open the editor — body, headings, links
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">→</span>
            </button>
          )}

          {/* Title */}
          <section className="flex flex-col gap-3">
            <SectionLede number="01" label="Title" />
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isPublished}
            />
            {!isPublished && (
              <button
                type="button"
                onClick={() => setShowAlternatives((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <RotateCcw className="size-3" />
                {showAlternatives ? "Hide alternatives" : "Regenerate suggestions"}
              </button>
            )}
            {showAlternatives && (
              <div className="flex flex-col gap-1.5">
                {TITLE_ALTERNATIVES.map((alt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickAlternative(alt)}
                    className={cn(
                      "text-left rounded-md border px-3 py-2.5 text-xs transition-colors",
                      title === alt
                        ? "border-foreground bg-card"
                        : "border-border bg-card hover:border-foreground/30"
                    )}
                  >
                    <span className="font-mono text-[10px] text-primary tracking-widest mr-2">
                      0{i + 1}
                    </span>
                    {alt}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Keyword */}
          <section className="flex flex-col gap-3">
            <SectionLede number="02" label="Target keyword" />
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2.5">
              <span className="font-mono text-sm flex-1">{keyword}</span>
              {locked && <Lock className="size-3 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono tabular-nums">
              <span>Vol <span className="text-foreground">{article.volume.toLocaleString()}</span></span>
              <span className="text-muted-foreground/40">·</span>
              <span>KD <span className="text-foreground">{article.difficulty}</span></span>
              <span className="text-muted-foreground/40">·</span>
              <span>CPC <span className="text-foreground">${article.cpc.toFixed(2)}</span></span>
            </div>
            {isScheduled && (
              <button
                type="button"
                onClick={() => setSwapOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors w-fit underline underline-offset-4"
              >
                Change keyword →
              </button>
            )}
          </section>

          {/* Type */}
          <section className="flex flex-col gap-3">
            <SectionLede number="03" label="Article type" />
            <Select
              value={type}
              onValueChange={(v) => v && setType(v)}
              disabled={locked}
            >
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

          {/* Date — reschedulable for scheduled AND generated */}
          {!isPublished && (
            <section className="flex flex-col gap-3">
              <SectionLede number="04" label={isGenerated ? "Reschedule" : "Scheduled date"} />
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
                    disabled={dateDisabled}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {isGenerated && (
                <p className="text-[11px] text-muted-foreground">
                  Article is already written — reschedule moves the publish date only.
                </p>
              )}
            </section>
          )}

          {/* Instructions */}
          {isScheduled && (
            <section className="flex flex-col gap-3">
              <SectionLede number="05" label="Additional instructions" />
              <p className="text-xs text-muted-foreground -mt-1">
                Tell the writer anything specific about this article.
              </p>
              <Textarea
                rows={4}
                placeholder="e.g. Focus more on the real-time sync angle. Mention that we have a free tier."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </section>
          )}

          {/* Generate-now CTA on scheduled rows */}
          {isScheduled && onGenerate && (
            <button
              type="button"
              onClick={() => {
                onGenerate(article)
                onOpenChange(false)
              }}
              className="group flex items-center justify-between gap-3 rounded-md border border-dashed border-border hover:border-foreground/40 transition-colors px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Generate now</span>
                  <span className="text-[11px] text-muted-foreground">
                    Don&apos;t wait — start the pipeline immediately
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">→</span>
            </button>
          )}
        </div>

        <SheetFooter className="border-t border-border px-6 py-4 flex-row justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {isPublished ? "Close" : "Cancel"}
          </Button>
          {!isPublished && (
            <Button type="button" onClick={handleSave}>
              Save changes
            </Button>
          )}
        </SheetFooter>
      </SheetContent>

      <KeywordSwapDialog
        open={swapOpen}
        onOpenChange={setSwapOpen}
        recommendedFunnel={article.funnel}
        onSwap={(k) => setKeyword(k)}
      />
    </Sheet>
  )
}
