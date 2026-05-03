"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnalysisStep } from "@/components/app/AnalysisStep"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"
import { WEB_ENTITY } from "@/lib/hack2hire"

const STEPS = [
  "Reading your website",
  "Identifying your product and ICP",
  "Detecting brand voice",
  "Finding your competitors",
  "Pulling keyword data",
  "Building your keyword strategy",
]

// Per-step duration (ms). Total ~7.5s before the redirect kicks in.
const STEP_DURATIONS = [1000, 1300, 900, 1300, 1700, 1300]

const COMPETITORS = WEB_ENTITY.competitors
  .slice(0, 2)
  .map((c) => c.url.replace(/^www\./, ""))

export default function AnalyzingPage() {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const [signals, setSignals] = useState(120)

  // Step progression — advances activeIdx; once past the last step, redirect.
  useEffect(() => {
    if (activeIdx >= STEPS.length) {
      const timer = setTimeout(() => router.push("/onboarding/profile"), 700)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(
      () => setActiveIdx((i) => i + 1),
      STEP_DURATIONS[activeIdx]
    )
    return () => clearTimeout(timer)
  }, [activeIdx, router])

  // Live signal counter — climbs while pipeline is running.
  useEffect(() => {
    if (activeIdx >= STEPS.length) return
    const interval = setInterval(() => {
      setSignals((s) => s + Math.floor(15 + Math.random() * 35))
    }, 220)
    return () => clearInterval(interval)
  }, [activeIdx])

  function stateOf(i: number): "done" | "active" | "pending" {
    if (i < activeIdx) return "done"
    if (i === activeIdx) return "active"
    return "pending"
  }

  const progressPct = Math.min(
    100,
    Math.round(((activeIdx + 0.5) / STEPS.length) * 100)
  )

  function handleEmailMe() {
    toast("We'll email you when your strategy is ready")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Analyzing" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-16">
      <div className="w-full max-w-md mx-auto flex flex-col gap-10">

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Reading <span className="font-mono text-primary">{WEB_ENTITY.context.website}</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sit tight. We&apos;re studying your site, your competitors, and the search
            landscape around you.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          <SectionLede number="A" label="Pipeline" />
          <div className="flex flex-col divide-y divide-border">
            {STEPS.map((label, i) => (
              <AnalysisStep
                key={label}
                number={String(i + 1).padStart(2, "0")}
                label={label}
                state={stateOf(i)}
              />
            ))}
          </div>
        </div>

        {/* Live counter */}
        <div className="flex flex-col gap-3">
          <SectionLede number="B" label="Signals collected" />
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl tabular-nums tracking-tight">
              {signals.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">keywords so far</span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Competitors */}
        <div className="flex flex-col gap-3">
          <SectionLede number="C" label="Competitors found" />
          <div className="flex flex-wrap gap-1.5">
            {COMPETITORS.map((domain, i) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1.5 border border-border bg-card rounded-full pl-2 pr-2.5 py-1 font-mono text-xs transition-opacity"
                style={{ opacity: activeIdx > i ? 1 : 0.4 }}
              >
                <span className="size-1 rounded-full bg-primary" />
                {domain}
              </span>
            ))}
            {activeIdx < STEPS.length && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
                + searching for more…
              </span>
            )}
          </div>
        </div>

        {/* Email fallback */}
        <button
          onClick={handleEmailMe}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left tracking-wide"
        >
          Don&apos;t want to wait? <span className="underline underline-offset-4">Email me when it&apos;s ready</span> →
        </button>

      </div>
      </main>
    </div>
  )
}
