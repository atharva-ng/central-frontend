"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  FileJson,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import {
  differenceInCalendarDays,
  differenceInHours,
  format,
  parseISO,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SectionLede } from "@/components/app/SectionLede"
import { FunnelBadge } from "@/components/app/FunnelBadge"
import { StatusBadge, type ArticleStatus } from "@/components/app/StatusBadge"
import { SegmentedControl } from "@/components/app/SegmentedControl"
import { OpportunityScore } from "@/components/app/OpportunityScore"
import {
  ArticleEditorContent,
  useArticleEditor,
} from "@/components/app/ArticleEditor"
import { ArticleToolbar } from "@/components/app/ArticleToolbar"
import { IndexlyLogo } from "@/components/app/IndexlyLogo"
import { ARTICLE, clusterLabel, type ArticleImage } from "@/lib/article-data"
import { cn } from "@/lib/utils"

const META_TITLE_MAX = 60
const META_DESC_MAX = 155

type ViewMode = "Edit" | "Preview"

export default function ArticleReviewPage() {
  const [status, setStatus] = useState<ArticleStatus>(ARTICLE.status)
  const [mode, setMode] = useState<ViewMode>("Edit")

  const [metaTitle, setMetaTitle] = useState(ARTICLE.meta_title)
  const [metaDesc, setMetaDesc] = useState(ARTICLE.meta_description)
  const [slug, setSlug] = useState(ARTICLE.url_slug)

  const [destination, setDestination] = useState<string>(ARTICLE.destination)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Editing is locked while the article is being generated.
  const isGenerating = status === "generating"
  const effectiveMode: ViewMode = isGenerating ? "Preview" : mode

  const editor = useArticleEditor({
    markdown: ARTICLE.article_content,
    images: ARTICLE.images,
    editable: effectiveMode === "Edit",
  })

  const autoPublishLine = useMemo(() => formatAutoPublish(status), [status])

  function handlePublish() {
    setPublishing(true)
    setTimeout(() => {
      setPublishing(false)
      setStatus("published")
      setPublishOpen(false)
      toast("Published to Framer successfully")
    }, 1400)
  }

  function copyMarkdown() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ARTICLE.article_content)
    }
    toast("Markdown copied to clipboard")
  }

  return (
    <>
      {/* Custom 3-section topbar with auto-publish subtitle */}
      <header className="border-b border-border sticky top-0 bg-background/85 backdrop-blur z-20 flex items-center px-6 gap-4 h-14">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Articles
          </Link>
        </div>
        <div className="flex-[2] min-w-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-sm font-medium truncate block max-w-md">
            {ARTICLE.title}
          </span>
          {autoPublishLine && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {autoPublishLine}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end shrink-0">
          <StatusBadge status={status} />
          {!isGenerating && (
            <Button size="sm" variant="outline" onClick={() => toast("Saved as draft")}>
              Save draft
            </Button>
          )}
          {status === "published" ? (
            <>
              <Button size="sm" variant="outline" onClick={() => toast("Opening live page…")}>
                View live
                <ExternalLink className="size-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast("Republishing…")}>
                <RefreshCw className="size-3.5" />
                Republish
              </Button>
            </>
          ) : isGenerating ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Pipeline running
            </span>
          ) : (
            <Button size="sm" onClick={() => setPublishOpen(true)}>
              <Upload className="size-3.5" />
              Publish
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => toast("Article duplicated")}>
                <Copy className="size-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete article
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* Left — editor */}
        <div className="flex-1 min-w-0 overflow-y-auto border-r border-border flex flex-col">

          {/* Editor toolbar */}
          <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <SegmentedControl<ViewMode>
                options={["Edit", "Preview"] as const}
                value={effectiveMode}
                onChange={(v) => !isGenerating && setMode(v)}
                size="sm"
              />
              {effectiveMode === "Edit" && !isGenerating && (
                <ArticleToolbar editor={editor} />
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
              {ARTICLE.word_count.toLocaleString()} words · 11 min read
            </span>
          </div>

          {/* Generating banner */}
          {isGenerating && (
            <div className="mx-6 mt-6 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 flex items-start gap-3">
              <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">Generating article…</p>
                <p className="text-xs text-muted-foreground">
                  Usually 2–3 minutes. Editing unlocks once the article is ready.
                </p>
              </div>
            </div>
          )}

          {/* Article body */}
          <div className="flex-1 px-12 py-8">
            <div className="max-w-3xl mx-auto">
              <ArticleEditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right — metadata panel */}
        <aside className="w-[340px] shrink-0 overflow-y-auto bg-card flex flex-col">

          {/* Section 1 — Status */}
          <Section number="01" label="Status">
            <div className="rounded-md border border-border bg-background flex flex-col items-center gap-1.5 py-3 px-4">
              <StatusBadge status={status} />
              <StatusFootnote status={status} />
            </div>
          </Section>

          <Divider />

          {/* Section 2 — Opportunity (prominent) */}
          <Section number="02" label="Opportunity">
            <div className="flex items-end justify-between gap-4">
              <OpportunityScore value={ARTICLE.opportunity_score} size="lg" showInfo />
              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Inputs
                </span>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  Vol {ARTICLE.volume.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  KD {ARTICLE.difficulty}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  CPC ${ARTICLE.cpc.toFixed(2)}
                </span>
              </div>
            </div>
          </Section>

          <Divider />

          {/* Section 3 — Details */}
          <Section number="03" label="Details">
            <dl className="grid grid-cols-[auto_1fr] gap-y-2.5 gap-x-4 text-sm">
              <Row label="Keyword">
                <span className="font-mono text-xs">{ARTICLE.keyword}</span>
              </Row>
              <Row label="Type">{ARTICLE.type}</Row>
              <Row label="Funnel">
                <FunnelBadge funnel={ARTICLE.funnel} />
              </Row>
              <Row label="Cluster">{clusterLabel(ARTICLE.cluster_id)}</Row>
              <Row label="Words">
                <span className="font-mono tabular-nums">{ARTICLE.word_count.toLocaleString()}</span>
              </Row>
              <Row label="Intent">
                <span className="capitalize">{ARTICLE.intent}</span>
              </Row>
            </dl>
          </Section>

          <Divider />

          {/* Section 4 — Publish */}
          <Section number="04" label="Publish">
            <div className="flex flex-col gap-3">
              <FieldLabel label="Destination" />
              <Select value={destination} onValueChange={(v) => v && setDestination(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="framer">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 rounded bg-foreground text-background flex items-center justify-center text-[10px] font-serif italic">F</span>
                      Framer
                    </span>
                  </SelectItem>
                  <SelectItem value="manual">Copy manually</SelectItem>
                  <SelectItem value="webflow" disabled>Webflow (coming soon)</SelectItem>
                  <SelectItem value="wordpress" disabled>WordPress (coming soon)</SelectItem>
                </SelectContent>
              </Select>

              {destination === "framer" && (
                <>
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-chart-3">
                    <CheckCircle2 className="size-3.5" />
                    Connected to <span className="font-mono">yoursite.framer.website</span>
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setPublishOpen(true)}
                    disabled={status === "published" || isGenerating}
                  >
                    <Upload className="size-3.5" />
                    {status === "published" ? "Already published" : "Publish to Framer"}
                  </Button>
                </>
              )}

              {destination === "manual" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={copyMarkdown}
                >
                  <Copy className="size-3.5" />
                  Copy article markdown
                </Button>
              )}
            </div>
          </Section>

          <Divider />

          {/* Section 5 — SEO & Meta */}
          <Section number="05" label="SEO & meta">
            <MetaField
              label="Title"
              value={metaTitle}
              onChange={setMetaTitle}
              max={META_TITLE_MAX}
            />
            <MetaField
              label="Description"
              value={metaDesc}
              onChange={setMetaDesc}
              max={META_DESC_MAX}
              textarea
            />
            <div className="flex flex-col gap-1">
              <FieldLabel label="Slug" />
              <div className="flex items-center gap-1 rounded-md border border-border bg-input/30 pl-2 focus-within:border-foreground transition-colors">
                <span className="text-xs text-muted-foreground font-mono select-none">/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="border-0 shadow-none px-1 h-9 text-xs font-mono bg-transparent focus-visible:ring-0"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Changing slug after publish will break existing links.
              </p>
            </div>
          </Section>

          <Divider />

          {/* Section 6 — Schema */}
          <Section number="06" label="Schema">
            <SchemaItem
              title="Article schema"
              json={ARTICLE.schema.article}
              generated={ARTICLE.schema.generated}
            />
            <SchemaItem
              title="FAQ schema"
              json={ARTICLE.schema.faq}
              generated={ARTICLE.schema.generated}
            />
          </Section>

          <Divider />

          {/* Section 7 — Images */}
          <Section number="07" label="Images">
            {ARTICLE.images.map((img) => (
              <ImageRow key={img.position} image={img} />
            ))}
          </Section>

          {/* Footer hint */}
          <div className="mt-auto p-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 flex items-center justify-between">
            <span>Auto-saved · 12s ago</span>
            <IndexlyLogo className="text-[11px]" />
          </div>
        </aside>
      </div>

      {/* Publish confirmation */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish to Framer</DialogTitle>
            <DialogDescription className="text-sm">
              This creates a new CMS item in your Framer project. It can&apos;t be
              undone from Indexly after publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/40 p-3 flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-snug">{ARTICLE.title}</p>
            <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
              /{slug} · {ARTICLE.word_count.toLocaleString()} words · {ARTICLE.funnel}
            </p>
          </div>
          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setPublishOpen(false)} disabled={publishing}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing && <Loader2 className="size-3.5 animate-spin" />}
              {publishing ? "Publishing…" : "Confirm publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this article?</DialogTitle>
            <DialogDescription className="text-sm">
              This permanently deletes the article and cannot be undone. The keyword
              goes back to your queue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast("Article deleted")
                setDeleteOpen(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function Section({
  number,
  label,
  children,
}: {
  number: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="px-4 pt-5 pb-5 flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tabular-nums tracking-widest text-primary">
          {number}
        </span>
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function Divider() {
  return <div className="h-px bg-border mx-4" />
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground self-center">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </>
  )
}

function FieldLabel({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {label}
    </span>
  )
}

function MetaField({
  label,
  value,
  onChange,
  max,
  textarea,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  max: number
  textarea?: boolean
}) {
  const over = value.length > max
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <FieldLabel label={label} />
        <span className={cn(
          "text-[11px] font-mono tabular-nums",
          over ? "text-destructive" : "text-muted-foreground"
        )}>
          {value.length} / {max}
        </span>
      </div>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="text-sm resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  )
}

function StatusFootnote({ status }: { status: ArticleStatus }) {
  if (status === "published") {
    return (
      <>
        <span className="text-[11px] text-muted-foreground">
          Published {ARTICLE.published_at ? format(parseISO(ARTICLE.published_at), "MMM d, yyyy") : "today"}
        </span>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono truncate max-w-[260px] hover:text-foreground transition-colors"
        >
          yoursite.framer.website/{ARTICLE.url_slug}
          <ExternalLink className="size-3" />
        </a>
      </>
    )
  }
  if (status === "review" && ARTICLE.auto_publish_at) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <CalendarDays className="size-3" />
        Auto-publishes {format(parseISO(ARTICLE.auto_publish_at), "MMM d, yyyy")} · {humanRelative(ARTICLE.auto_publish_at)}
      </span>
    )
  }
  if (status === "scheduled" && ARTICLE.auto_publish_at) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <CalendarDays className="size-3" />
        Scheduled for {format(parseISO(ARTICLE.auto_publish_at), "MMM d, yyyy")}
      </span>
    )
  }
  if (status === "generating") {
    return (
      <span className="text-[11px] text-muted-foreground">
        Pipeline started just now
      </span>
    )
  }
  return null
}

function SchemaItem({
  title,
  json,
  generated,
}: {
  title: string
  json: object
  generated: boolean
}) {
  const formatted = JSON.stringify(json, null, 2)
  return (
    <Collapsible className="rounded-md border border-border">
      <CollapsibleTrigger className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium hover:bg-muted/40 transition-colors group">
        <FileJson className="size-3.5 text-muted-foreground" />
        <span className="flex-1 text-left">{title}</span>
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]",
          generated ? "text-chart-3" : "text-amber-600 dark:text-amber-400"
        )}>
          <span className={cn(
            "size-1.5 rounded-full",
            generated ? "bg-chart-3" : "bg-amber-500"
          )} />
          {generated ? "Generated" : "Pending"}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="relative bg-muted/40 border-t border-border max-h-44 overflow-auto">
          <pre className="p-3 text-[11px] font-mono leading-relaxed">
            <code>{formatted}</code>
          </pre>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined") navigator.clipboard.writeText(formatted)
              toast("Schema copied")
            }}
            className="absolute top-2 right-2 size-6 rounded-md bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy schema"
          >
            <Copy className="size-3" />
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ImageRow({ image }: { image: ArticleImage }) {
  const generated = !!image.s3_key
  return (
    <div className="flex items-center gap-3">
      {generated ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.s3_key}
          alt={image.alt}
          className="w-16 h-10 rounded object-cover shrink-0 border border-border"
        />
      ) : (
        <div className="w-16 h-10 rounded shrink-0 bg-muted border border-dashed border-border" />
      )}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm capitalize">{image.position.replace("-", " ")}</span>
        <span className={cn(
          "text-[11px] inline-flex items-center gap-1",
          generated ? "text-chart-3" : "text-amber-600 dark:text-amber-400"
        )}>
          {generated ? (
            <>
              <span className="size-1 rounded-full bg-chart-3" />
              Generated
            </>
          ) : (
            <>
              <Loader2 className="size-3 animate-spin" />
              Generating…
            </>
          )}
        </span>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatAutoPublish(status: ArticleStatus): string | null {
  if (status === "review" && ARTICLE.auto_publish_at) {
    return `Auto-publishes ${format(parseISO(ARTICLE.auto_publish_at), "MMM d")} · ${humanRelative(ARTICLE.auto_publish_at)}`
  }
  if (status === "scheduled" && ARTICLE.auto_publish_at) {
    return `Scheduled for ${format(parseISO(ARTICLE.auto_publish_at), "MMM d")}`
  }
  if (status === "published" && ARTICLE.published_at) {
    return `Published ${format(parseISO(ARTICLE.published_at), "MMM d")}`
  }
  return null
}

function humanRelative(iso: string): string {
  const target = parseISO(iso)
  const now = new Date()
  const days = differenceInCalendarDays(target, now)
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} ago`
  if (days === 0) {
    const h = Math.max(0, differenceInHours(target, now))
    return h <= 1 ? "in less than an hour" : `in ${h}h`
  }
  if (days === 1) return "in 1 day"
  return `in ${days} days`
}
