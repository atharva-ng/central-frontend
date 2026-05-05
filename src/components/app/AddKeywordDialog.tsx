"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { FunnelBadge } from "@/components/app/FunnelBadge"
import { OpportunityScore } from "@/components/app/OpportunityScore"
import {
  CLUSTERS,
  findDuplicate,
  lookupKeyword,
  type KeywordLookup,
} from "@/lib/keywords"
import { cn } from "@/lib/utils"

interface AddKeywordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  remaining: number
  onAdded: (lookup: KeywordLookup | { keyword: string; manual: true }) => void
}

// Phases:
//   idle      — has query text, waiting for user to click "Look up & add"
//   empty     — no query yet
//   duplicate — instant client-side check (no credit used)
//   fetching  — user clicked, API call in flight
//   ready     — data returned, confirm to add
//   no-data   — keyword not found, can still add manually
//   submitting — adding, closes after
type Phase =
  | { kind: "empty" }
  | { kind: "idle" }
  | { kind: "duplicate"; existing: { cluster: string; status: string; scheduledFor?: string } }
  | { kind: "fetching" }
  | { kind: "ready"; data: KeywordLookup }
  | { kind: "no-data" }
  | { kind: "submitting"; data?: KeywordLookup }

export function AddKeywordDialog({ open, onOpenChange, remaining, onAdded }: AddKeywordDialogProps) {
  const [query, setQuery] = useState("")
  const [phase, setPhase] = useState<Phase>({ kind: "empty" })

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setQuery("")
      setPhase({ kind: "empty" })
    }
  }, [open])

  function handleQueryChange(value: string) {
    setQuery(value)

    const trimmed = value.trim()
    if (!trimmed) {
      setPhase({ kind: "empty" })
      return
    }

    // Duplicate check is free (client-side) — surface it immediately
    const dup = findDuplicate(trimmed)
    if (dup) {
      setPhase({
        kind: "duplicate",
        existing: {
          cluster: dup.cluster,
          status: dup.entry.status,
          scheduledFor: dup.entry.scheduledFor,
        },
      })
      return
    }

    setPhase({ kind: "idle" })
  }

  function handleLookupAndAdd() {
    const trimmed = query.trim()
    if (!trimmed || phase.kind === "duplicate") return

    // Uses 1 manual keyword credit
    setPhase({ kind: "fetching" })
    setTimeout(() => {
      const data = lookupKeyword(trimmed)
      if (data) setPhase({ kind: "ready", data })
      else setPhase({ kind: "no-data" })
    }, 1100)
  }

  function handleConfirm() {
    if (phase.kind !== "ready" && phase.kind !== "no-data") return
    const data = phase.kind === "ready" ? phase.data : undefined
    setPhase({ kind: "submitting", data })
    setTimeout(() => {
      if (data) {
        onAdded(data)
        toast(`Keyword added · ${data.cluster} cluster`)
      } else {
        onAdded({ keyword: query.trim(), manual: true })
        toast("Keyword added without data")
      }
      onOpenChange(false)
    }, 900)
  }

  const isSubmitting = phase.kind === "submitting"
  const canLookup = (phase.kind === "idle") && query.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Add a keyword</DialogTitle>
          <DialogDescription className="text-xs">
            Keyword data is fetched when you click add — this uses one manual keyword credit.
          </DialogDescription>
          <p className="text-[11px] text-muted-foreground mt-1">
            <span className="font-mono tabular-nums">{remaining}</span> of{" "}
            <span className="font-mono tabular-nums">10</span> manual keywords remaining this month
          </p>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canLookup && handleLookupAndAdd()}
            placeholder="e.g. system design interview"
            autoFocus
            disabled={isSubmitting || phase.kind === "fetching"}
            className="text-sm"
          />

          {/* Fetching skeleton */}
          {phase.kind === "fetching" && (
            <>
              <div className="rounded-md bg-muted p-3 flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" />
                Fetching keyword data — using 1 credit…
              </p>
            </>
          )}

          {/* Ready — show data, ask to confirm */}
          {phase.kind === "ready" && (
            <>
              <div className="rounded-md bg-muted p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-medium truncate">{phase.data.keyword}</span>
                  <FunnelBadge funnel={phase.data.suggestedFunnel} />
                </div>
                <p className="font-mono text-sm tabular-nums">
                  Vol {phase.data.volume.toLocaleString()} · KD {phase.data.difficulty} · CPC ${phase.data.cpc.toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Intent: {phase.data.intent} · Suggested funnel: {phase.data.suggestedFunnel}
                </p>
                {(() => {
                  const exists = CLUSTERS.some((c) => c.name === phase.data.cluster)
                  return (
                    <p className="text-[11px] text-muted-foreground">
                      {exists ? (
                        <>Will be added to <span className="text-foreground">{phase.data.cluster}</span> cluster</>
                      ) : (
                        <>Will create a new cluster <span className="text-foreground">&ldquo;{phase.data.cluster}&rdquo;</span></>
                      )}
                    </p>
                  )
                })()}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                <span className="text-[11px] text-muted-foreground">Opportunity score</span>
                <OpportunityScore value={phase.data.score} size="md" />
              </div>
            </>
          )}

          {/* No data */}
          {phase.kind === "no-data" && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3 flex items-start gap-2">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                No reliable data found for this keyword. It may have very low
                search volume or be too niche. You can still add it manually.
              </p>
            </div>
          )}

          {/* Duplicate — instant, no credit used */}
          {phase.kind === "duplicate" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive p-3 flex flex-col gap-1">
              <p className="text-xs font-medium">Already in your queue.</p>
              <p className="text-[11px] opacity-80">
                Cluster: {phase.existing.cluster} · Status: {phase.existing.status}
                {phase.existing.scheduledFor && ` · Scheduled for ${phase.existing.scheduledFor}`}
              </p>
            </div>
          )}

          {/* Idle hint */}
          {phase.kind === "idle" && (
            <p className="text-[11px] text-muted-foreground">
              Click <span className="text-foreground">Look up &amp; add</span> to fetch volume, difficulty, and intent — uses 1 credit.
            </p>
          )}

          {phase.kind === "empty" && (
            <p className="text-[11px] text-muted-foreground">
              Type a keyword to get started.
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex-row justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || phase.kind === "fetching"}
          >
            Cancel
          </Button>

          {/* Step 1: Look up (uses credit) */}
          {(phase.kind === "empty" || phase.kind === "idle" || phase.kind === "duplicate") && (
            <Button
              type="button"
              onClick={handleLookupAndAdd}
              disabled={!canLookup}
            >
              Look up &amp; add
            </Button>
          )}

          {/* Step 2: Confirm after data is shown */}
          {(phase.kind === "ready" || phase.kind === "no-data" || phase.kind === "submitting") && (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="size-3.5 animate-spin" /> Adding…</>
              ) : phase.kind === "no-data" ? (
                "Add anyway"
              ) : (
                "Confirm add"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PlanCapDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className={cn(
            "size-10 rounded-md bg-muted border border-border flex items-center justify-center mb-2"
          )}>
            <Lock className="size-4 text-muted-foreground" />
          </div>
          <DialogTitle>Manual keyword limit reached</DialogTitle>
          <DialogDescription className="text-sm">
            You&apos;ve used all 10 manual keywords on your current plan.
            Upgrade to Growth for unlimited manual keywords.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button onClick={() => { toast("Redirecting to billing…"); onOpenChange(false) }}>
            Upgrade plan →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
