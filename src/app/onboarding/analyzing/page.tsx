"use client"

import { toast } from "sonner"
import { AnalysisStep } from "@/components/app/AnalysisStep"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"

const STEPS = [
  { num: "01", label: "Reading your website", state: "done" as const },
  { num: "02", label: "Identifying your product and ICP", state: "done" as const },
  { num: "03", label: "Detecting brand voice", state: "done" as const },
  { num: "04", label: "Finding your competitors", state: "done" as const },
  { num: "05", label: "Pulling keyword data", state: "active" as const },
  { num: "06", label: "Building your keyword strategy", state: "pending" as const },
]

const COMPETITORS = ["coefficient.app", "coupler.io"]

export default function AnalyzingPage() {
  function handleEmailMe() {
    toast("We'll email you when your strategy is ready")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-10">

        <Masthead phase="Analyzing" />

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Reading <span className="font-mono text-primary">indexly.ai</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sit tight. We&apos;re studying your site, your competitors, and the search
            landscape around you.
          </p>
        </div>

        {/* Steps — vertical list, hairline-separated, no card box */}
        <div className="flex flex-col gap-3">
          <SectionLede number="A" label="Pipeline" />
          <div className="flex flex-col divide-y divide-border">
            {STEPS.map((s) => (
              <AnalysisStep key={s.num} number={s.num} label={s.label} state={s.state} />
            ))}
          </div>
        </div>

        {/* Live counter — editorial style, big number */}
        <div className="flex flex-col gap-3">
          <SectionLede number="B" label="Signals collected" />
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl tabular-nums tracking-tight">786</span>
            <span className="text-sm text-muted-foreground">keywords so far</span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Competitors — editorial chip line */}
        <div className="flex flex-col gap-3">
          <SectionLede number="C" label="Competitors found" />
          <div className="flex flex-wrap gap-1.5">
            {COMPETITORS.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1.5 border border-border bg-card rounded-full pl-2 pr-2.5 py-1 font-mono text-xs"
              >
                <span className="size-1 rounded-full bg-primary" />
                {domain}
              </span>
            ))}
            <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
              + searching for more…
            </span>
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
  )
}
