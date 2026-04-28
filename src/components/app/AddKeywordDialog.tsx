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

type Phase =
  | { kind: "empty" }
  | { kind: "typing" }
  | { kind: "fetching" }
  | { kind: "ready"; data: KeywordLookup }
  | { kind: "no-data" }
  | { kind: "duplicate"; existing: { cluster: string; status: string; scheduledFor?: string } }

export function AddKeywordDialog({ open, onOpenChange, remaining, onAdded }: AddKeywordDialogProps) {
  const [query, setQuery] = useState("")
  const [phase, setPhase] = useState<Phase>({ kind: "empty" })
  const [submitting, setSubmitting] = useState(false)

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setQuery("")
      setPhase({ kind: "empty" })
      setSubmitting(false)
    }
  }, [open])

  // Debounced lookup
  useEffect(() => {
    if (!query.trim()) {
      setPhase({ kind: "empty" })
      return
    }
    setPhase({ kind: "typing" })

    let fetchTimer: ReturnType<typeof setTimeout> | undefined
    const debounceTimer = setTimeout(() => {
      setPhase({ kind: "fetching" })
      fetchTimer = setTimeout(() => {
        const dup = findDuplicate(query)
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
        const data = lookupKeyword(query)
        if (data) setPhase({ kind: "ready", data })
        else setPhase({ kind: "no-data" })
      }, 1100)
    }, 600)

    return () => {
      clearTimeout(debounceTimer)
      if (fetchTimer) clearTimeout(fetchTimer)
    }
  }, [query])

  const canAdd =
    !submitting &&
    (phase.kind === "ready" || phase.kind === "no-data") &&
    query.trim().length > 0

  function handleAdd() {
    if (!canAdd) return
    setSubmitting(true)
    setTimeout(() => {
      if (phase.kind === "ready") {
        onAdded(phase.data)
        toast(`Keyword added · ${phase.data.cluster} cluster`)
      } else if (phase.kind === "no-data") {
        onAdded({ keyword: query.trim(), manual: true })
        toast("Keyword added without data")
      }
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Add a keyword</DialogTitle>
          <DialogDescription className="text-xs">
            We&apos;ll fetch volume, difficulty, and intent automatically.
          </DialogDescription>
          <p className="text-[11px] text-muted-foreground mt-1">
            <span className="font-mono tabular-nums">{remaining}</span> of{" "}
            <span className="font-mono tabular-nums">10</span> manual keywords remaining this month
          </p>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. salesforce crm reporting"
            autoFocus
            className="text-sm"
          />

          {/* Phase-driven body */}
          {phase.kind === "fetching" && (
            <>
              <div className="rounded-md bg-muted p-3 flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" />
                Fetching keyword data from DataForSEO…
              </p>
            </>
          )}

          {phase.kind === "ready" && (
            <>
              <div className="rounded-md bg-muted p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-medium truncate">{phase.data.keyword}</span>
                  <FunnelBadge funnel={phase.data.suggestedFunnel} />
                </div>
                <p className="text-sm font-mono tabular-nums">
                  Vol {phase.data.volume.toLocaleString()} · KD {phase.data.difficulty} · CPC ${phase.data.cpc.toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Intent: {phase.data.intent} · Suggested funnel: {phase.data.suggestedFunnel}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Will be added to <span className="text-foreground">{phase.data.cluster}</span> cluster
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                <span className="text-[11px] text-muted-foreground">
                  Opportunity score
                </span>
                <OpportunityScore value={phase.data.score} size="md" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Queued below higher-scoring keywords in your selected cluster.
              </p>
            </>
          )}

          {phase.kind === "no-data" && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3 flex items-start gap-2">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                We couldn&apos;t find reliable data for this keyword. It may have very low
                search volume or be too niche. You can still add it manually.
              </p>
            </div>
          )}

          {phase.kind === "duplicate" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive p-3 flex flex-col gap-1">
              <p className="text-xs font-medium">This keyword is already in your queue.</p>
              <p className="text-[11px] opacity-80">
                Cluster: {phase.existing.cluster} · Status: {phase.existing.status}
                {phase.existing.scheduledFor && ` · Scheduled for ${phase.existing.scheduledFor}`}
              </p>
            </div>
          )}

          {(phase.kind === "empty" || phase.kind === "typing") && (
            <p className="text-[11px] text-muted-foreground">
              Type at least 4 characters to look up data.
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex-row justify-between sm:justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!canAdd}>
            {submitting && <Loader2 className="size-3.5 animate-spin" />}
            {phase.kind === "no-data" ? "Add anyway" : "Add to queue"}
          </Button>
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
