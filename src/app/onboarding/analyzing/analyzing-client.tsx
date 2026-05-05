"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { AnalysisStep } from "@/components/app/AnalysisStep"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"
import {
  ApiError,
  ONBOARDING_STEPS,
  beginOnboarding,
  fetchOnboardingStepClient,
} from "@/lib/api/client"
import type { OnboardingStep } from "@/lib/api/client"

const STEPS = [
  { num: "01", label: "Reading your website" },
  { num: "02", label: "Identifying your product and ICP" },
  { num: "03", label: "Detecting brand voice" },
  { num: "04", label: "Finding your competitors" },
  { num: "05", label: "Getting compititor data" },
  { num: "06", label: "Building your keyword strategy" },
] as const

const PENDING_KEY = "blogengine.pendingOnboarding"
const WEB_ENTITY_ID_KEY = "blogengine.webEntityId"
// 3s feels responsive without hammering the backend during a multi-second
// pipeline. Tune up if backend rate-limits the steps endpoint.
const POLL_INTERVAL_MS = 3000

interface AnalyzingClientProps {
  initialStep: OnboardingStep
  initialWebsiteUrl: string | null
}

function deriveHostname(websiteUrl: string): string {
  try {
    return new URL(websiteUrl).hostname.replace(/^www\./, "")
  } catch {
    return websiteUrl
  }
}

export function AnalyzingClient({ initialStep, initialWebsiteUrl }: AnalyzingClientProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const [website, setWebsite] = useState<string>(() =>
    initialWebsiteUrl ? deriveHostname(initialWebsiteUrl) : "",
  )

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    let pending: { websiteUrl: string; country: string } | null = null
    try {
      const stored = sessionStorage.getItem(PENDING_KEY)
      if (stored) pending = JSON.parse(stored) as { websiteUrl: string; country: string }
    } catch {
      // sessionStorage unavailable; tolerated below.
    }

    if (pending && !initialWebsiteUrl) {
      // Syncing display state from sessionStorage (an external store) on
      // mount — the legitimate exception listed in React's
      // set-state-in-effect guidance.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebsite(deriveHostname(pending.websiteUrl))
    }

    // Fresh submit landed here without server-side webEntity yet (USER_CREATED)
    // and without the in-flight pending payload — nothing to do, send back.
    if (initialStep === ONBOARDING_STEPS.USER_CREATED && !pending) {
      router.replace("/onboarding")
      return
    }

    async function poll() {
      if (cancelled) return
      try {
        const { step } = await fetchOnboardingStepClient(getToken)
        if (cancelled) return
        if (step === ONBOARDING_STEPS.CONTEXT_CREATED) {
          router.push("/onboarding/profile")
          return
        }
        if (step === ONBOARDING_STEPS.FINALISED) {
          router.push("/onboarding/strategy")
          return
        }
        // USER_CREATED here would mean backend rolled back — extremely
        // unexpected. Keep polling rather than yanking the user away.
      } catch {
        // Network hiccup — quietly try again on the next tick. Surfacing a
        // toast on every failure during a long pipeline would be noisy.
      }
      if (!cancelled) {
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    async function run() {
      // Only the very first visit (USER_CREATED + pending payload) should
      // POST /v1/onboard. On reload the step is already WEBENTITY_CREATED and
      // we go straight to polling — beginOnboarding is idempotent on the
      // backend but skipping it avoids an unnecessary round-trip.
      if (initialStep === ONBOARDING_STEPS.USER_CREATED && pending) {
        try {
          const { webEntityId } = await beginOnboarding(getToken, pending)
          if (cancelled) return
          try {
            sessionStorage.removeItem(PENDING_KEY)
            window.localStorage.setItem(WEB_ENTITY_ID_KEY, webEntityId)
          } catch {
            // storage unavailable; steps API re-supplies the id on next load.
          }
        } catch (err) {
          if (cancelled) return
          const message =
            err instanceof ApiError
              ? `Couldn't start analysis (${err.status}).`
              : "Couldn't reach the server. Check your connection."
          toast.error(message)
          router.push("/onboarding")
          return
        }
      }
      poll()
    }

    run()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
    // getToken/router are stable; initialStep/initialWebsiteUrl are server props.
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
