"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { AnalysisStep } from "@/components/app/AnalysisStep"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"
import {
  STRATEGY_COMPETITOR_STAGGER_MS,
  STRATEGY_COUNTER_TICK_MS,
  STRATEGY_DASHBOARD_REDIRECT_MS,
  STRATEGY_ELAPSED_POLL_MS,
  STRATEGY_STEP_DURATIONS_MS,
} from "@/constants/onboarding-timing"
import { APP_ROUTES } from "@/constants/routes"
import { WEB_ENTITY } from "@/lib/hack2hire"
import { ONBOARDING_STEPS, useOnboardingStepPolling } from "@/lib/api/client"

const STEPS = [
  "Business profile confirmed",
  "Pulling keywords from 3 competitors",
  "Expanding your seed keywords",
  "Filtering and classifying keywords",
  "Grouping into topic clusters",
  "Scoring opportunities",
  "Building your content schedule",
]

const COMPETITOR_DOMAINS = WEB_ENTITY.competitors.map((c) =>
  c.url.replace(/^www\./, "")
)

export default function StrategyPage() {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const [emailRequested, setEmailRequested] = useState(false)
  const [keywordsCollected, setKeywordsCollected] = useState(312)
  const [clusters, setClusters] = useState(1)

  // Step progression
  useEffect(() => {
    if (activeIdx >= STEPS.length) {
      // Land on the dashboard once the strategy is "ready".
      const timer = setTimeout(
        () => router.push(APP_ROUTES.dashboard),
        STRATEGY_DASHBOARD_REDIRECT_MS,
      )
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(
      () => setActiveIdx((i) => i + 1),
      STRATEGY_STEP_DURATIONS_MS[activeIdx]
    )
    return () => clearTimeout(timer)
  }, [activeIdx, router])

  // Counter ticks while active
  useEffect(() => {
    if (activeIdx >= STEPS.length) return
    const interval = setInterval(() => {
      setKeywordsCollected((k) => k + Math.floor(20 + Math.random() * 80))
    }, STRATEGY_COUNTER_TICK_MS)
    return () => clearInterval(interval)
  }, [activeIdx])

  // Cluster count grows around step 4 (grouping)
  useEffect(() => {
    if (activeIdx === 4) setClusters(3)
    if (activeIdx === 5) setClusters(5)
    if (activeIdx >= 6) setClusters(6)
  }, [activeIdx])

  function stateOf(i: number): "done" | "active" | "pending" {
    if (i < activeIdx) return "done"
    if (i === activeIdx) return "active"
    return "pending"
  }

  // Per-competitor pull state — under step 02 (index 1).
  // Each competitor finishes loading 800ms apart while step 02 is active.
  function competitorState(i: number): "loading" | "done" {
    if (activeIdx > 1) return "done"
    if (activeIdx < 1) return "loading"
    // step 1 is active — use elapsed-time heuristic via ref isn't simple,
    // so split by index: i=0 done at 600ms, i=1 at 1200ms, i=2 at 1800ms.
    return "loading"
  }

  // Track how long step 1 has been active to stagger competitor completion.
  const [step1Elapsed, setStep1Elapsed] = useState(0)
  useEffect(() => {
    if (activeIdx !== 1) return
    const start = Date.now()
    const interval = setInterval(() => {
      setStep1Elapsed(Date.now() - start)
    }, STRATEGY_ELAPSED_POLL_MS)
    return () => clearInterval(interval)
  }, [activeIdx])

  function isCompetitorDone(i: number): boolean {
    if (activeIdx > 1) return true
    if (activeIdx < 1) return false
    return step1Elapsed > (i + 1) * STRATEGY_COMPETITOR_STAGGER_MS
  }

  const progressPct = Math.min(
    100,
    Math.round(((activeIdx + 0.5) / STEPS.length) * 100)
  )

  useOnboardingStepPolling({ expectedStep: ONBOARDING_STEPS.FINALISED })

  function handleEmailMe() {
    toast("Got it — we'll email you when your strategy is ready")
    setEmailRequested(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Building strategy" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-16">
      <div className="mx-auto w-full max-w-md flex flex-col gap-10">

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            {activeIdx >= STEPS.length
              ? "Strategy ready ✨"
              : "Building your keyword strategy…"}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {activeIdx >= STEPS.length
              ? "Routing you to the dashboard…"
              : "Takes 2–3 minutes. You can wait, or we'll email you when it's ready."}
          </p>
          {!emailRequested && activeIdx < STEPS.length && (
            <button
              type="button"
              onClick={handleEmailMe}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left underline underline-offset-4 w-fit"
            >
              Email me when done →
            </button>
          )}
        </div>

        {/* Pipeline */}
        <div className="flex flex-col gap-3">
          <SectionLede number="A" label="Pipeline" />
          <div className="flex flex-col divide-y divide-border">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-col">
                <AnalysisStep
                  number={String(i + 1).padStart(2, "0")}
                  label={label}
                  state={stateOf(i)}
                />
                {/* Sub-items under step 02 — competitor pull progress */}
                {i === 1 && activeIdx >= 1 && (
                  <div className="ml-[58px] mb-3 flex flex-col gap-1.5">
                    {COMPETITOR_DOMAINS.map((domain, ci) => (
                      <div
                        key={domain}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-muted-foreground">{domain}</span>
                        <span
                          className={
                            isCompetitorDone(ci)
                              ? "text-primary"
                              : "text-muted-foreground/60"
                          }
                        >
                          {isCompetitorDone(ci) ? "200 keywords found" : "loading…"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-3">
          <SectionLede number="B" label="Progress" />
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-mono tabular-nums text-foreground">
                {keywordsCollected.toLocaleString()}
              </span>{" "}
              keywords collected
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span>
              <span className="font-mono tabular-nums text-foreground">{clusters}</span>{" "}
              clusters identified
            </span>
          </div>
        </div>

        {/* Skip — still useful even when timed */}
        {activeIdx < STEPS.length && (
          <div className="flex justify-center pt-2">
            <Link
              href={APP_ROUTES.dashboard}
              className="group inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 hover:text-foreground transition-colors"
            >
              Skip to dashboard
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

      </div>
      </main>
    </div>
  )
}
