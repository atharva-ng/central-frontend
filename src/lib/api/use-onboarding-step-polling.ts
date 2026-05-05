"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { fetchOnboardingStepClient } from "./onboarding.client"
import { STEP_TO_PAGE, type OnboardingStep } from "./onboarding-steps"

const DEFAULT_POLL_INTERVAL_MS = 3000

interface Options {
  expectedStep: OnboardingStep
  intervalMs?: number
  enabled?: boolean
}

export function useOnboardingStepPolling({
  expectedStep,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
  enabled = true,
}: Options) {
  const router = useRouter()
  const { getToken } = useAuth()

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    async function poll() {
      if (cancelled) return
      try {
        const { step } = await fetchOnboardingStepClient(getToken)
        if (cancelled) return
        if (step !== expectedStep) {
          router.push(STEP_TO_PAGE[step])
          return
        }
      } catch {
        // Network hiccup — retry on the next tick. A toast on every failure
        // during a long pipeline would be noisy.
      }
      if (!cancelled) {
        timeoutId = setTimeout(poll, intervalMs)
      }
    }

    poll()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [expectedStep, intervalMs, enabled, getToken, router])
}
