"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { AnalysisStep } from "@/components/app/AnalysisStep"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"

const STEPS = [
  { num: "01", label: "Business profile confirmed", state: "done" as const },
  { num: "02", label: "Pulling keywords from 3 competitors", state: "done" as const },
  { num: "03", label: "Expanding your seed keywords", state: "active" as const },
  { num: "04", label: "Filtering and classifying keywords", state: "pending" as const },
  { num: "05", label: "Grouping into topic clusters", state: "pending" as const },
  { num: "06", label: "Scoring opportunities", state: "pending" as const },
  { num: "07", label: "Building your content schedule", state: "pending" as const },
]

const COMPETITOR_PULL = [
  { domain: "coefficient.app", status: "200 keywords found" },
  { domain: "coupler.io", status: "200 keywords found" },
  { domain: "supermetrics.com", status: "loading…" },
]

export default function StrategyPage() {
  const [emailRequested, setEmailRequested] = useState(false)

  function handleEmailMe() {
    toast("Got it — we'll email you when your strategy is ready")
    setEmailRequested(true)
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-md flex flex-col gap-10">

        <Masthead phase="Building strategy" />

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Building your keyword strategy…
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Takes 2–3 minutes. You can wait, or we&apos;ll email you when it&apos;s ready.
          </p>
          {!emailRequested && (
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
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex flex-col">
                <AnalysisStep number={s.num} label={s.label} state={s.state} />
                {/* Sub-items under step 02 (competitors) when active or after */}
                {i === 1 && (
                  <div className="ml-[58px] mb-3 flex flex-col gap-1.5">
                    {COMPETITOR_PULL.map((c) => (
                      <div
                        key={c.domain}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-muted-foreground">{c.domain}</span>
                        <span className={
                          c.status === "loading…"
                            ? "text-muted-foreground/60"
                            : "text-primary"
                        }>
                          {c.status}
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
              style={{ width: "28%" }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-mono tabular-nums text-foreground">1,247</span> keywords collected
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span>
              <span className="font-mono tabular-nums text-foreground">6</span> clusters identified
            </span>
          </div>
        </div>

        {/* Skip */}
        <div className="flex justify-center pt-2">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 hover:text-foreground transition-colors"
          >
            Skip to dashboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </main>
  )
}
