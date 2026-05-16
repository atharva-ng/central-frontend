"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { addWeeks, format, parseISO, startOfWeek } from "date-fns"
import {
  Edit3,
  Eye,
  FileText,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { FunnelBadge, StatusBadge, Topbar } from "@/components/app"
import {
  APP_ROUTES,
  ARTICLE_FILTERS,
  type ArticleStatus,
  type Funnel,
} from "@/constants"
import {
  useScheduledArticlesByWeeks,
  type ScheduledArticleDTO,
} from "@/lib/api/client"
import { cn } from "@/lib/utils"

interface ArticleRow {
  id: string
  title: string
  keyword: string
  type: string
  funnel: Funnel
  words: number
  status: ArticleStatus
  scheduledFor: string | null
}

/** Backend articles only carry calendar essentials — the columns the table
 *  renders that aren't on the DTO yet (funnel, word count) get neutral
 *  defaults until a richer endpoint exists. */
function toRow(dto: ScheduledArticleDTO): ArticleRow {
  return {
    id: dto.id,
    title: dto.title || dto.keyword,
    keyword: dto.keyword,
    type: dto.articleType ?? "—",
    funnel: "TOFU",
    words: 0,
    status: dto.status,
    scheduledFor: dto.scheduleDate
      ? format(parseISO(dto.scheduleDate), "MMM d, yyyy")
      : null,
  }
}

const FILTERS = ARTICLE_FILTERS.map((f) => ({
  ...f,
  match:
    f.id === "all"
      ? () => true
      : (a: ArticleRow) => a.status === f.id,
}))

export default function ArticlesIndexPage() {
  const [tab, setTab] = useState<string>("all")

  // Show the next four Mon-aligned weeks. Week-aligned so cache entries line
  // up exactly with /dashboard's per-week fetches and can be reused.
  const weekStarts = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 4 }, (_, i) => addWeeks(start, i))
  }, [])
  const load = useScheduledArticlesByWeeks(weekStarts)

  const rows = useMemo<ArticleRow[]>(
    () => (load.kind === "ready" ? load.data.articles.map(toRow) : []),
    [load],
  )

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === tab) ?? FILTERS[0]
    return rows.filter(f.match)
  }, [rows, tab])

  const stats = useMemo(
    () => ({
      total: rows.length,
      review: rows.filter((a) => a.status === "readyForReview").length,
      published: rows.filter((a) => a.status === "published").length,
      scheduled: rows.filter(
        (a) => a.status === "scheduled" || a.status === "generating",
      ).length,
    }),
    [rows],
  )

  return (
    <>
      <Topbar title="Articles" />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          <Stat label="Total articles" value={stats.total} />
          <Stat label="Ready to review" value={stats.review} accent />
          <Stat label="Published" value={stats.published} />
          <Stat label="Scheduled / generating" value={stats.scheduled} />
        </div>

        {load.kind === "loading" && <ArticlesSkeleton />}

        {load.kind === "missing-web-entity" && (
          <ArticlesNotice
            title="No articles yet"
            body="Finish onboarding to start generating articles."
          />
        )}

        {load.kind === "error" && (
          <ArticlesNotice title="Couldn't load articles" body={load.message} />
        )}

        {load.kind === "ready" && (
          <Tabs value={tab} onValueChange={(v) => v && setTab(v)} className="flex flex-col gap-4">
            <TabsList>
              {FILTERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {FILTERS.map((f) => (
              <TabsContent key={f.id} value={f.id} className="m-0">
                {visible.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ArticleTable rows={visible} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
        </div>
      </main>
    </>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-card p-4 flex flex-col gap-1">
      <span className={cn(
        "font-mono text-2xl tabular-nums tracking-tight",
        accent ? "text-primary" : "text-foreground"
      )}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function ArticleTable({ rows }: { rows: ArticleRow[] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_180px_140px_70px_80px_140px_120px_90px] gap-4 px-4 py-3 border-b border-border text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span>Title</span>
        <span>Keyword</span>
        <span>Type</span>
        <span>Funnel</span>
        <span className="tabular-nums">Words</span>
        <span>Status</span>
        <span>Scheduled</span>
        <span className="text-right">Actions</span>
      </div>
      {/* Rows */}
      {rows.map((a) => (
        <div
          key={a.id}
          className="grid grid-cols-[1fr_180px_140px_70px_80px_140px_120px_90px] gap-4 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group"
        >
          <Link
            href={APP_ROUTES.articleDetail(a.id)}
            className="text-sm font-medium truncate hover:text-primary transition-colors"
          >
            {a.title}
          </Link>
          <span className="font-mono text-[11px] text-muted-foreground truncate">{a.keyword}</span>
          <span className="text-xs truncate">{a.type}</span>
          <span><FunnelBadge funnel={a.funnel} /></span>
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
            {a.words.toLocaleString()}
          </span>
          <span><StatusBadge status={a.status} /></span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {a.scheduledFor ?? "—"}
          </span>
          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {a.status !== "generating" && a.status !== "scheduled" && a.status !== "published" && (
              <>
                <Link
                  href={APP_ROUTES.articleView(a.id)}
                  className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="View article"
                >
                  <Eye className="size-3.5" />
                </Link>
                <Link
                  href={APP_ROUTES.articleDetail(a.id)}
                  className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Edit article"
                >
                  <Edit3 className="size-3.5" />
                </Link>
              </>
            )}
            {a.status !== "generating" && a.status !== "published" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  toast(`Removed "${a.keyword}" from articles`)
                }}
                className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                aria-label="Delete article"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-72" />
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-border last:border-b-0 flex items-center gap-4"
          >
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ArticlesNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border rounded-lg bg-card px-6 py-12 flex flex-col items-center gap-1 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground max-w-sm">{body}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 flex flex-col items-center gap-3 text-center">
      <FileText className="size-8 text-muted-foreground/60" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">No articles yet</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Your first articles will appear here once generation begins.
        </p>
      </div>
      <Button size="sm" onClick={() => toast("Open Schedule to add your first article")}>
        Open schedule
      </Button>
    </div>
  )
}
