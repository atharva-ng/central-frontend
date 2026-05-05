"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { fetchOnboardingStepClient } from "./onboarding.client"
import { STEP_TO_PAGE, type OnboardingStep } from "./onboarding-steps"

const DEFAULT_INITIAL_INTERVAL_MS = 3000
const DEFAULT_MAX_INTERVAL_MS = 30_000

interface Options {
  expectedStep: OnboardingStep
  initialIntervalMs?: number
  maxIntervalMs?: number
  enabled?: boolean
}

export function useOnboardingStepPolling({
  expectedStep,
  initialIntervalMs = DEFAULT_INITIAL_INTERVAL_MS,
  maxIntervalMs = DEFAULT_MAX_INTERVAL_MS,
  enabled = true,
}: Options) {
  const router = useRouter()
  const { getToken } = useAuth()

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let nextDelayMs = initialIntervalMs

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
        timeoutId = setTimeout(poll, nextDelayMs)
        // Backoff after each tick — pipeline runs are often longer than the
        // initial 3s interval suggests, so we ease off rather than hammer.
        nextDelayMs = Math.min(nextDelayMs * 2, maxIntervalMs)
      }
    }

    poll()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [expectedStep, initialIntervalMs, maxIntervalMs, enabled, getToken, router])
}
