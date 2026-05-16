"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Copy,
  ExternalLink,
  FileJson,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  differenceInCalendarDays,
  differenceInHours,
  format,
  parseISO,
} from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Skeleton } from "@/components/ui"
import { ArticleEditorContent, FunnelBadge, IndexlyLogo, OpportunityScore, StatusBadge, useArticleEditor } from "@/components/app"
import { APP_ROUTES, BRAND, type ArticleStatus } from "@/constants"
import { useArticleByScheduleId } from "@/lib/api/client"
import { articleDtoToRecord } from "@/lib/article-adapter"
import { clusterLabel, type ArticleImage, type ArticleRecord } from "@/lib/article-data"
import { cn } from "@/lib/utils"

export default function ArticleViewPage() {
  const params = useParams<{ id: string }>()
  const load = useArticleByScheduleId(params?.id)

  const article = useMemo<ArticleRecord | null>(
    () => (load.kind === "ready" ? articleDtoToRecord(load.data) : null),
    [load],
  )

  if (load.kind === "loading") return <ArticleLoading />
  if (load.kind === "not-found") return <ArticleNotice title="Article not found" body="This article may have been deleted or never existed." />
  if (load.kind === "error") return <ArticleNotice title="Couldn't load article" body={load.message} />
  if (!article) return null

  return <ArticleView article={article} />
}

function ArticleView({ article }: { article: ArticleRecord }) {
  const status: ArticleStatus = article.status

  const editor = useArticleEditor({
    markdown: article.article_content,
    images: article.images,
    editable: false,
  })

  const autoPublishLine = useMemo(() => formatAutoPublish(status, article), [status, article])

  return (
    <>
      {/* Custom 3-section topbar with auto-publish subtitle */}
      <header className="border-b border-border shrink-0 bg-background flex items-center px-6 gap-4 h-14">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link
            href={APP_ROUTES.articles}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Articles
          </Link>
        </div>
        <div className="flex-[2] min-w-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-sm font-medium truncate block max-w-md">
            {article.title}
          </span>
          {autoPublishLine && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {autoPublishLine}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Read-only
          </span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* Left — article content */}
        <div className="flex-1 min-w-0 overflow-y-auto border-r border-border flex flex-col">

          {/* Header strip */}
          <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 px-6 py-2.5 flex items-center justify-end gap-4">
            <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
              {article.word_count.toLocaleString()} words · {readingTime(article.word_count)} min read
            </span>
          </div>

          {/* Article body */}
          <div className="flex-1 px-12 py-8">
            <div className="max-w-3xl mx-auto">
              <ArticleEditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right — metadata panel (read-only) */}
        <aside className="w-[340px] shrink-0 overflow-y-auto bg-card flex flex-col">

          {/* Section 1 — Status */}
          <Section number="01" label="Status">
            <div className="rounded-md border border-border bg-background flex flex-col items-center gap-1.5 py-3 px-4">
              <StatusBadge status={status} />
              <StatusFootnote status={status} article={article} />
            </div>
          </Section>

          <Divider />

          {/* Section 2 — Opportunity */}
          <Section number="02" label="Opportunity">
            <div className="flex items-end justify-between gap-4">
              <OpportunityScore value={article.opportunity_score} size="lg" showInfo />
              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Inputs
                </span>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  Vol {article.volume.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  KD {article.difficulty}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  CPC ${article.cpc.toFixed(2)}
                </span>
              </div>
            </div>
          </Section>

          <Divider />

          {/* Section 3 — Details */}
          <Section number="03" label="Details">
            <dl className="grid grid-cols-[auto_1fr] gap-y-2.5 gap-x-4 text-sm">
              <Row label="Keyword">
                <span className="font-mono text-xs">{article.keyword}</span>
              </Row>
              <Row label="Type">{article.type}</Row>
              <Row label="Funnel">
                <FunnelBadge funnel={article.funnel} />
              </Row>
              <Row label="Cluster">{clusterLabel(article.cluster_id)}</Row>
              <Row label="Words">
                <span className="font-mono tabular-nums">{article.word_count.toLocaleString()}</span>
              </Row>
              <Row label="Intent">
                <span className="capitalize">{article.intent}</span>
              </Row>
            </dl>
          </Section>

          <Divider />

          {/* Section 4 — SEO & Meta */}
          <Section number="04" label="SEO & meta">
            <ReadOnlyField label="Title" value={article.meta_title} />
            <ReadOnlyField label="Description" value={article.meta_description} multiline />
            <div className="flex flex-col gap-1">
              <FieldLabel label="Slug" />
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 h-9">
                <span className="text-xs text-muted-foreground font-mono select-none">/</span>
                <span className="text-xs font-mono truncate">{article.url_slug}</span>
              </div>
            </div>
          </Section>

          <Divider />

          {/* Section 5 — Schema */}
          <Section number="05" label="Schema">
            <SchemaItem
              title="Article schema"
              json={article.schema.article}
              generated={article.schema.generated}
            />
            <SchemaItem
              title="FAQ schema"
              json={article.schema.faq}
              generated={article.schema.generated}
            />
          </Section>

          <Divider />

          {/* Section 6 — Images */}
          <Section number="06" label="Images">
            {article.images.map((img) => (
              <ImageRow key={img.position} image={img} />
            ))}
          </Section>

          {/* Footer */}
          <div className="border-t border-border p-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 flex items-center justify-between mt-auto">
            <span>View only</span>
            <IndexlyLogo className="text-[11px]" />
          </div>
        </aside>
      </div>
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

function ReadOnlyField({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel label={label} />
      <div
        className={cn(
          "rounded-md border border-border bg-muted/30 px-3 py-2 text-sm",
          multiline ? "whitespace-pre-wrap" : "truncate",
        )}
      >
        {value}
      </div>
    </div>
  )
}

function StatusFootnote({ status, article }: { status: ArticleStatus; article: ArticleRecord }) {
  if (status === "published") {
    return (
      <>
        <span className="text-[11px] text-muted-foreground">
          Published {article.published_at ? format(parseISO(article.published_at), "MMM d, yyyy") : "today"}
        </span>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono truncate max-w-[260px] hover:text-foreground transition-colors"
        >
          {BRAND.framerHost}/{article.url_slug}
          <ExternalLink className="size-3" />
        </a>
      </>
    )
  }
  if (status === "readyForReview" && article.auto_publish_at) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <CalendarDays className="size-3" />
        Auto-publishes {format(parseISO(article.auto_publish_at), "MMM d, yyyy")} · {humanRelative(article.auto_publish_at)}
      </span>
    )
  }
  if (status === "scheduled" && article.auto_publish_at) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <CalendarDays className="size-3" />
        Scheduled for {format(parseISO(article.auto_publish_at), "MMM d, yyyy")}
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

function ArticleLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <Skeleton className="h-6 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-1/3 max-w-xs" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

function ArticleNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="border border-border rounded-lg bg-card px-6 py-12 flex flex-col items-center gap-2 text-center max-w-md">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
        <Link
          href={APP_ROUTES.articles}
          className="text-xs text-primary mt-2 hover:underline"
        >
          ← Back to articles
        </Link>
      </div>
    </div>
  )
}

function readingTime(words: number): number {
  return Math.max(1, Math.round(words / 225))
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

function formatAutoPublish(status: ArticleStatus, article: ArticleRecord): string | null {
  if (status === "readyForReview" && article.auto_publish_at) {
    return `Auto-publishes ${format(parseISO(article.auto_publish_at), "MMM d")} · ${humanRelative(article.auto_publish_at)}`
  }
  if (status === "scheduled" && article.auto_publish_at) {
    return `Scheduled for ${format(parseISO(article.auto_publish_at), "MMM d")}`
  }
  if (status === "published" && article.published_at) {
    return `Published ${format(parseISO(article.published_at), "MMM d")}`
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
