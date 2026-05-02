"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Edit3,
  Eye,
  FileText,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Topbar } from "@/components/app/Topbar"
import { StatusBadge, type ArticleStatus } from "@/components/app/StatusBadge"
import { FunnelBadge, type Funnel } from "@/components/app/FunnelBadge"
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

const ARTICLES: ArticleRow[] = [
  {
    id: "art_010",
    title: "How to Crack Senior-Level Interviews: 8 Patterns Every SDE II Candidate Should Master",
    keyword: "interview questions and answers for experience",
    type: "How-To + Comparison",
    funnel: "MOFU",
    words: 3247,
    status: "review",
    scheduledFor: "Apr 23, 2026",
  },
  {
    id: "art_011",
    title: "15 System Design Patterns Every SDE II Must Know",
    keyword: "system design patterns sde",
    type: "Listicle",
    funnel: "MOFU",
    words: 2890,
    status: "scheduled",
    scheduledFor: "May 1, 2026",
  },
  {
    id: "art_012",
    title: "AlgoExpert Alternatives: 7 Platforms for Real SDE Interview Prep",
    keyword: "algoexpert alternatives",
    type: "Alternatives List",
    funnel: "MOFU",
    words: 2640,
    status: "published",
    scheduledFor: "Apr 20, 2026",
  },
  {
    id: "art_013",
    title: "How to Prepare for FAANG Behavioral Rounds in 2 Weeks",
    keyword: "faang behavioral interview prep",
    type: "How-To Guide",
    funnel: "TOFU",
    words: 2100,
    status: "generating",
    scheduledFor: null,
  },
  {
    id: "art_014",
    title: "What Is the STAR Method and How Do You Use It",
    keyword: "star method interview",
    type: "What-Is / Definition",
    funnel: "TOFU",
    words: 1980,
    status: "scheduled",
    scheduledFor: "May 3, 2026",
  },
]

const STATS = {
  total: 12,
  review: 3,
  published: 2,
  scheduled: 7,
}

const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "review", label: "Ready for review", match: (a: ArticleRow) => a.status === "review" },
  { id: "scheduled", label: "Scheduled", match: (a: ArticleRow) => a.status === "scheduled" },
  { id: "published", label: "Published", match: (a: ArticleRow) => a.status === "published" },
  { id: "generating", label: "Generating", match: (a: ArticleRow) => a.status === "generating" },
] as const

export default function ArticlesIndexPage() {
  const [tab, setTab] = useState<string>("all")

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === tab) ?? FILTERS[0]
    return ARTICLES.filter(f.match)
  }, [tab])

  return (
    <>
      <Topbar title="Articles" />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          <Stat label="Total articles" value={STATS.total} />
          <Stat label="Ready to review" value={STATS.review} accent />
          <Stat label="Published" value={STATS.published} />
          <Stat label="Scheduled / generating" value={STATS.scheduled} />
        </div>

        {/* Filter tabs + table */}
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
            href={`/articles/${a.id}`}
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
            <Link
              href={`/articles/${a.id}`}
              className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="View article"
            >
              <Eye className="size-3.5" />
            </Link>
            <Link
              href={`/articles/${a.id}`}
              className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Edit article"
            >
              <Edit3 className="size-3.5" />
            </Link>
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
          </div>
        </div>
      ))}
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
