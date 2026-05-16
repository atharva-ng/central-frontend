"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowUpRight,
  Plus,
  GripVertical,
  MoreHorizontal,
  Sparkles,
  Pencil,
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns"
import { toast } from "sonner"
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Skeleton } from "@/components/ui"
import { AddArticleSheet, EditArticleSheet, StatusBadge, Topbar } from "@/components/app"
import {
  canDropOn,
  formatDayLabel,
  isDraggable,
  type Article,
} from "@/lib/articles"
import { seoBlogRepository, useScheduledArticlesByWeeks, type ScheduledArticleDTO } from "@/lib/api/client"
import { cn } from "@/lib/utils"

/**
 * Maps a backend ScheduledArticle into the calendar's richer Article shape.
 * The scheduled-articles endpoint only carries calendar essentials, so the
 * SEO fields the calendar renders are filled with neutral defaults until a
 * dedicated article endpoint surfaces them. Status flows through from the
 * backend directly — the wire format matches the frontend's enum labels.
 */
function toArticle(dto: ScheduledArticleDTO): Article {
  return {
    id: dto.id,
    title: dto.title || dto.keyword,
    keyword: dto.keyword,
    funnel: "TOFU",
    volume: 0,
    difficulty: 0,
    cpc: 0,
    type: dto.articleType ?? "",
    status: dto.status,
    // scheduleDate is always 00:00 UTC of the publish day — take the date part
    // directly rather than parsing to a local Date (which can shift the day).
    scheduledFor: dto.scheduleDate.slice(0, 10),
  }
}

export default function DashboardPage() {
  const { getToken } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [editing, setEditing] = useState<Article | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addDefaultDate, setAddDefaultDate] = useState<string | undefined>()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Tracks scheduled-article IDs with an in-flight orchestrate request.
  // The optimistic status flip to "generating" already hides the trigger,
  // but two clicks can fire before React commits — this set is the
  // belt-and-suspenders dedupe so the second click is dropped.
  const generatingRef = useRef<Set<string>>(new Set())

  // Week state — anchor to Monday
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  // Scheduled articles for the visible week, fetched from the backend.
  // Local edits/drag operate on the `articles` copy and reset when the week
  // (and therefore the fetch) changes — there is no persistence endpoint yet.
  // The hook shares its module-level cache with /articles, so flipping
  // between the two screens reuses already-fetched weeks.
  const load = useScheduledArticlesByWeeks([weekStart])
  useEffect(() => {
    // Seeding local state from the fetch result (an external store) — the
    // legitimate exception in React's set-state-in-effect guidance.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArticles(load.kind === "ready" ? load.data.articles.map(toArticle) : [])
  }, [load])

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const weekArticles = useMemo(() => {
    return articles.filter((a) => {
      const d = parseISO(a.scheduledFor)
      return weekDays.some((wd) => isSameDay(wd, d))
    })
  }, [articles, weekDays])

  const articlesByDay = useMemo(() => {
    const map = new Map<string, Article[]>()
    for (const day of weekDays) {
      map.set(format(day, "yyyy-MM-dd"), [])
    }
    for (const a of weekArticles) {
      map.get(a.scheduledFor)?.push(a)
    }
    return map
  }, [weekDays, weekArticles])

  const stats = useMemo(() => {
    return {
      total: weekArticles.length,
      readyForReview: weekArticles.filter((a) => a.status === "readyForReview").length,
      published: weekArticles.filter((a) => a.status === "published").length,
      scheduled: weekArticles.filter((a) => a.status === "scheduled").length,
    }
  }, [weekArticles])

  const isCurrentWeek = isSameDay(
    weekStart,
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openEdit(a: Article) {
    setEditing(a)
    setEditOpen(true)
  }

  function openAdd(forDate?: string) {
    setAddDefaultDate(forDate)
    setAddOpen(true)
  }

  function handleSave(updated: Article) {
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  function handleCreate(created: Article) {
    setArticles((prev) => [...prev, created])
    toast(`Scheduled “${created.keyword}” for ${format(parseISO(created.scheduledFor), "MMM d")}`)
  }

  async function handleGenerateNow(a: Article) {
    // Drop duplicate clicks while a request is mid-flight.
    if (generatingRef.current.has(a.id)) return
    generatingRef.current.add(a.id)

    setArticles((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, status: "generating" } : x))
    )
    toast("Generation started — usually takes 2–3 minutes")

    try {
      await seoBlogRepository.orchestrate(getToken, {
        scheduledArticleId: a.id,
        articleType: a.type,
        proposedTitle: a.title,
      })
    } catch {
      // Roll back the optimistic flip so the user can retry.
      setArticles((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, status: "scheduled" } : x))
      )
      generatingRef.current.delete(a.id)
      toast("Couldn't start generation — please try again")
    }
  }

  function handleDelete(a: Article) {
    setArticles((prev) => prev.filter((x) => x.id !== a.id))
    toast(`Removed “${a.keyword}” from the schedule`)
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function onDragStart(e: DragStartEvent) {
    setDraggingId(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setDraggingId(null)
    if (!e.over) return
    const articleId = String(e.active.id)
    const targetIso = String(e.over.id)
    const article = articles.find((a) => a.id === articleId)
    if (!article) return

    const targetDate = parseISO(targetIso)
    if (article.scheduledFor === targetIso) return
    if (!canDropOn(article, targetDate)) {
      toast("Can't drop there — needs at least 24h before publish")
      return
    }
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, scheduledFor: targetIso } : a))
    )
  }

  const draggingArticle = draggingId
    ? articles.find((a) => a.id === draggingId) ?? null
    : null

  return (
    <>
      <Topbar
        title="Schedule"
        action={
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="size-3.5" />
            New article
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">

        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setWeekStart((d) => addWeeks(d, -1))}
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium tracking-tight px-2">
              {weekLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setWeekStart((d) => addWeeks(d, 1))}
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </Button>
            {!isCurrentWeek && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 text-xs"
                onClick={() =>
                  setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
                }
              >
                Today
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Drag scheduled rows to reschedule</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          <Stat label="Articles this week" value={stats.total} />
          <Stat label="Ready to review" value={stats.readyForReview} accent />
          <Stat label="Published" value={stats.published} />
          <Stat label="Scheduled" value={stats.scheduled} />
        </div>

        {/* Schedule */}
        {load.kind === "loading" && <ScheduleSkeleton />}

        {load.kind === "missing-web-entity" && (
          <ScheduleNotice
            title="No schedule yet"
            body="Finish onboarding to generate your publishing calendar."
          />
        )}

        {load.kind === "error" && (
          <ScheduleNotice title="Couldn't load the schedule" body={load.message} />
        )}

        {load.kind === "ready" && (
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDraggingId(null)}
          >
            <div className="flex flex-col">
              {weekDays.map((day) => {
                const iso = format(day, "yyyy-MM-dd")
                const items = articlesByDay.get(iso) ?? []
                return (
                  <DayColumn
                    key={iso}
                    date={day}
                    iso={iso}
                    articles={items}
                    draggingArticle={draggingArticle}
                    onEdit={openEdit}
                    onAdd={() => openAdd(iso)}
                    onGenerate={handleGenerateNow}
                    onDelete={handleDelete}
                  />
                )
              })}
            </div>

            <DragOverlay>
              {draggingArticle ? (
                <div className="bg-card border border-foreground/40 rounded-md px-4 py-3 shadow-lg w-[480px] max-w-[90vw]">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={draggingArticle.status} />
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{draggingArticle.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        </div>
      </main>

      <EditArticleSheet
        article={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSave}
        onGenerate={handleGenerateNow}
      />
      <AddArticleSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={handleCreate}
        defaultDate={addDefaultDate}
      />
    </>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}

function ScheduleNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border rounded-lg bg-card px-6 py-12 flex flex-col items-center gap-1 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground max-w-sm">{body}</p>
    </div>
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

function DayColumn({
  date,
  iso,
  articles,
  draggingArticle,
  onEdit,
  onAdd,
  onGenerate,
  onDelete,
}: {
  date: Date
  iso: string
  articles: Article[]
  draggingArticle: Article | null
  onEdit: (a: Article) => void
  onAdd: () => void
  onGenerate: (a: Article) => void
  onDelete: (a: Article) => void
}) {
  const valid = draggingArticle ? canDropOn(draggingArticle, date) : true
  const { setNodeRef, isOver } = useDroppable({ id: iso, disabled: !valid })

  const today = isSameDay(date, new Date())

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex flex-col scroll-mt-20 transition-colors rounded-md",
        isOver && valid && "bg-primary/5 ring-1 ring-primary/30",
        draggingArticle && !valid && "opacity-50"
      )}
    >
      <div className="flex items-baseline gap-3 mt-6 mb-2">
        <span className={cn(
          "font-mono text-[11px] tabular-nums tracking-widest",
          today ? "text-primary" : "text-muted-foreground"
        )}>
          {format(date, "dd")}
        </span>
        <span className="text-sm font-medium tracking-tight">
          {formatDayLabel(iso)}
        </span>
        {today && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary font-medium">
            Today
          </span>
        )}
        <div className="h-px flex-1 bg-border" />
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="size-3" />
          Add
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="text-[11px] text-muted-foreground/60 italic py-3 pl-7">
          {draggingArticle && valid ? "Drop here to reschedule" : "—"}
        </div>
      ) : (
        <div className="flex flex-col">
          {articles.map((a) => (
            <ArticleRow
              key={a.id}
              article={a}
              onEdit={() => onEdit(a)}
              onGenerate={() => onGenerate(a)}
              onDelete={() => onDelete(a)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function ArticleRow({
  article,
  onEdit,
  onGenerate,
  onDelete,
}: {
  article: Article
  onEdit: () => void
  onGenerate: () => void
  onDelete: () => void
}) {
  const draggable = isDraggable(article)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: article.id,
    disabled: !draggable,
  })

  const isGenerating = article.status === "generating"

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-center gap-3 py-4 border-t border-border last:border-b transition-opacity",
        isDragging && "opacity-30"
      )}
    >
      {/* Drag handle */}
      <div className="shrink-0 w-4 flex items-center justify-center">
        {draggable ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="size-4 flex items-center justify-center text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Drag to reschedule"
          >
            <GripVertical className="size-3.5" />
          </button>
        ) : (
          <span className="size-3 rounded-full bg-border" />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <StatusBadge status={article.status} />
          <span className="text-[11px] text-muted-foreground font-mono">
            {article.funnel}
          </span>
        </div>
        <h3 className="text-sm font-medium leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-mono">{article.keyword}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="tabular-nums">{article.volume.toLocaleString()} vol</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{article.type}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isGenerating ? (
          <Skeleton className="h-8 w-20" />
        ) : article.status === "readyForReview" ? (
          <>
            <Button size="sm" onClick={onEdit}>Review</Button>
            <RowMenu article={article} onEdit={onEdit} onGenerate={onGenerate} onDelete={onDelete} />
          </>
        ) : article.status === "published" ? (
          <Button size="sm" variant="ghost">
            View
            <ArrowUpRight className="size-3.5" />
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
            <RowMenu article={article} onEdit={onEdit} onGenerate={onGenerate} onDelete={onDelete} />
          </>
        )}
      </div>
    </div>
  )
}

function RowMenu({
  article,
  onEdit,
  onGenerate,
  onDelete,
}: {
  article: Article
  onEdit: () => void
  onGenerate: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="More actions"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-3.5" />
          {article.status === "readyForReview" ? "Review" : "Edit"}
        </DropdownMenuItem>
        {article.status === "scheduled" && (
          <DropdownMenuItem onClick={onGenerate}>
            <Sparkles className="size-3.5" />
            Generate now
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

