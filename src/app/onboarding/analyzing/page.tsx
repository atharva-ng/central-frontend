"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { AnalysisStep } from "@/components/app/AnalysisStep"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"
import { ApiError, beginOnboarding } from "@/lib/api/client"

const STEPS = [
  { num: "01", label: "Reading your website" },
  { num: "02", label: "Identifying your product and ICP" },
  { num: "03", label: "Detecting brand voice" },
  { num: "04", label: "Finding your competitors" },
  { num: "05", label: "Getting compititor data" },
  { num: "06", label: "Building your keyword strategy" },
] as const

export default function AnalyzingPage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const [website, setWebsite] = useState<string>("")

  useEffect(() => {
    let params: { websiteUrl: string; country: string } | null = null
    try {
      const stored = sessionStorage.getItem("blogengine.pendingOnboarding")
      if (stored) params = JSON.parse(stored) as { websiteUrl: string; country: string }
    } catch {
      // sessionStorage unavailable
    }

    if (!params) {
      router.replace("/onboarding")
      return
    }

    try {
      setWebsite(new URL(params.websiteUrl).hostname.replace(/^www\./, ""))
    } catch {
      setWebsite(params.websiteUrl)
    }

    const captured = params
    async function run() {
      try {
        const { webEntityId } = await beginOnboarding(getToken, captured)
        try {
          sessionStorage.removeItem("blogengine.pendingOnboarding")
          window.localStorage.setItem("blogengine.webEntityId", webEntityId)
        } catch {
          // storage unavailable; steps API re-supplies the id on next load
        }
        router.push("/onboarding/profile")
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `Couldn't start analysis (${err.status}).`
            : "Couldn't reach the server. Check your connection."
        toast.error(message)
        router.push("/onboarding")
      }
    }

    run()
    // getToken is stable across renders; router is stable — safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            {website ? (
              <>Reading <span className="font-mono text-primary">{website}</span></>
            ) : (
              "Reading your website."
            )}
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
            {STEPS.map((s, i) => (
              <AnalysisStep
                key={s.num}
                number={s.num}
                label={s.label}
                state={i < 4 ? "done" : i === 4 ? "active" : "pending"}
              />
            ))}
          </div>
        </div>

        {/* Live counter */}
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

        {/* Competitors */}
        <div className="flex flex-col gap-3">
          <SectionLede number="C" label="Competitors found" />
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
              Searching for competitors…
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
    </div>
  )
}
