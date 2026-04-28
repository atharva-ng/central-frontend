"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Topbar } from "@/components/app/Topbar"
import { SectionLede } from "@/components/app/SectionLede"
import { StatusBadge } from "@/components/app/StatusBadge"
import { FunnelBadge } from "@/components/app/FunnelBadge"
import { OpportunityScore } from "@/components/app/OpportunityScore"
import { AddKeywordDialog, PlanCapDialog } from "@/components/app/AddKeywordDialog"
import {
  CLUSTERS,
  PLAN_LIMIT,
  totalKeywords,
  type Cluster,
  type ClusterKeyword,
} from "@/lib/keywords"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<ClusterKeyword["status"], string> = {
  generated: "Generated",
  scheduled: "Scheduled",
  queued: "Queued",
}

const STATUS_TO_BADGE: Record<ClusterKeyword["status"], "review" | "scheduled" | "queued"> = {
  generated: "review",
  scheduled: "scheduled",
  queued: "queued",
}

export default function KeywordsPage() {
  const [activeId, setActiveId] = useState(CLUSTERS[0].id)
  const [usage, setUsage] = useState(8)
  const [addOpen, setAddOpen] = useState(false)
  const [capOpen, setCapOpen] = useState(false)

  const active = CLUSTERS.find((c) => c.id === activeId) ?? CLUSTERS[0]
  const overCap = usage >= PLAN_LIMIT

  function handleAddClick() {
    if (overCap) setCapOpen(true)
    else setAddOpen(true)
  }

  return (
    <>
      <Topbar
        title="Keywords"
        action={
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              <span className="font-mono tabular-nums">{usage}</span> /{" "}
              <span className="font-mono tabular-nums">{PLAN_LIMIT}</span> manual keywords used this month
            </span>
            <Button size="sm" variant="outline" onClick={handleAddClick}>
              <Plus className="size-3.5" />
              Add keyword
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 min-h-0">

        {/* Cluster list */}
        <aside className="w-72 shrink-0 border-r border-border overflow-y-auto flex flex-col">
          <div className="px-4 pt-5 pb-2">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Topic clusters
            </h2>
          </div>
          <div className="flex flex-col">
            {CLUSTERS.map((c) => (
              <ClusterButton
                key={c.id}
                cluster={c}
                active={c.id === activeId}
                onClick={() => setActiveId(c.id)}
              />
            ))}
          </div>
          <div className="mt-auto border-t border-border px-4 py-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              <span className="font-mono tabular-nums">{totalKeywords()}</span> keywords
            </span>
            <span>
              <span className="font-mono tabular-nums">{CLUSTERS.length}</span> clusters
            </span>
          </div>
        </aside>

        {/* Cluster detail */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">

            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{active.name}</h1>
                {active.pillarPublished ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-2/40 bg-chart-2/10 text-chart-3 px-2 py-0.5 text-[11px] font-medium">
                    <span className="size-1.5 rounded-full bg-chart-3" />
                    Pillar published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[11px] font-medium">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Pillar pending
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono tabular-nums">{active.keywordCount}</span> keywords ·
                {" "}1 pillar · {active.supporting.length} supporting articles tracked
              </p>
            </div>

            {/* Pillar */}
            <section className="flex flex-col gap-3">
              <SectionLede number="01" label="Pillar article" />
              <PillarCard k={active.pillar} />
            </section>

            {/* Supporting */}
            <section className="flex flex-col gap-3">
              <SectionLede number="02" label="Supporting articles" />
              {active.supporting.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No supporting keywords yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {active.supporting
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((k) => (
                      <SupportingRow key={k.keyword} k={k} />
                    ))}
                </div>
              )}

              <TooltipProvider>
                {overCap ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          className="w-full rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground/60 cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                          disabled
                        >
                          <Plus className="size-3.5" />
                          Add keyword manually
                        </button>
                      }
                    />
                    <TooltipContent>
                      You&apos;ve used all 10 manual keywords this month. Upgrade to Growth for unlimited.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="w-full rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Add keyword manually
                  </button>
                )}
              </TooltipProvider>
            </section>
          </div>
        </main>
      </div>

      <AddKeywordDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        remaining={PLAN_LIMIT - usage}
        onAdded={() => setUsage((u) => Math.min(PLAN_LIMIT, u + 1))}
      />
      <PlanCapDialog open={capOpen} onOpenChange={setCapOpen} />
    </>
  )
}

function ClusterButton({
  cluster,
  active,
  onClick,
}: {
  cluster: Cluster
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors",
        active
          ? "bg-accent text-accent-foreground border-l-primary"
          : "border-l-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className={cn("text-sm font-medium truncate", active && "text-foreground")}>
          {cluster.name}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {cluster.keywordCount} keywords
        </span>
      </div>
      <span
        className={cn(
          "size-1.5 rounded-full shrink-0",
          cluster.pillarPublished ? "bg-chart-3" : "bg-amber-500"
        )}
        title={cluster.pillarPublished ? "Pillar published" : "Pillar pending"}
      />
    </button>
  )
}

function PillarCard({ k }: { k: ClusterKeyword }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-primary/40 bg-card px-2 py-0.5 text-[10px] font-mono font-medium tracking-widest text-primary">
          PILLAR
        </span>
        <FunnelBadge funnel={k.funnel} />
        <div className="ml-auto">
          <StatusBadge
            status={STATUS_TO_BADGE[k.status]}
            label={STATUS_LABEL[k.status]}
          />
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-mono text-base font-medium tracking-tight truncate">{k.keyword}</p>
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground font-mono tabular-nums">
            {k.volume !== null && <span>Vol {k.volume.toLocaleString()}</span>}
            {k.difficulty !== null && <><span className="text-muted-foreground/40">·</span><span>KD {k.difficulty}</span></>}
            {k.cpc && <><span className="text-muted-foreground/40">·</span><span>CPC ${k.cpc.toFixed(2)}</span></>}
          </div>
        </div>
        <OpportunityScore value={k.score} size="lg" />
      </div>
    </div>
  )
}

function SupportingRow({ k }: { k: ClusterKeyword }) {
  return (
    <div className="group flex items-center gap-4 py-3 border-t border-border last:border-b">
      <div className="w-14 shrink-0 flex items-center">
        <OpportunityScore value={k.score} size="sm" showInfo={false} />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FunnelBadge funnel={k.funnel} />
          {k.manuallyAdded && (
            <span className="text-[10px] text-muted-foreground tracking-widest font-mono">MANUAL</span>
          )}
        </div>
        <span className="font-mono text-sm truncate">{k.keyword}</span>
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground font-mono tabular-nums">
          {k.volume !== null ? <span>Vol {k.volume.toLocaleString()}</span> : <span className="italic">No data</span>}
          {k.difficulty !== null && <><span className="text-muted-foreground/40">·</span><span>KD {k.difficulty}</span></>}
        </div>
      </div>
      <div className="shrink-0">
        <StatusBadge
          status={STATUS_TO_BADGE[k.status]}
          label={
            k.status === "scheduled" && k.scheduledFor
              ? `Scheduled · ${k.scheduledFor}`
              : STATUS_LABEL[k.status]
          }
        />
      </div>
    </div>
  )
}
