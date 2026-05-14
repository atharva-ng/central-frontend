"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ONBOARDING_STATE_FRESH_MS } from "@/constants"
import { onboardingRepository } from "@/lib/api/client"
import { STEP_TO_PAGE, type OnboardingStep } from "@/lib/api/onboarding-steps"
import {
  isOnboardingStateFresh,
  readOnboardingState,
  writeOnboardingState,
} from "@/lib/api/onboarding-state-cache"

interface OnboardingGuardProps {
  /** The step this page is meant to serve. */
  expectedStep: OnboardingStep
  /** The step the server component just read from `/v1/onboarding-steps`. */
  serverStep: OnboardingStep
}

/**
 * Client-side onboarding freshness guard.
 *
 * The server component that renders this has already gated the page once.
 * This keeps the redirect decision honest on client-side navigation between
 * onboarding screens, following the freshness rule:
 *
 *   - cached state younger than ONBOARDING_STATE_FRESH_MS → trust the cache,
 *     no network call, redirect from it
 *   - no cached state → seed the cache from the server's just-fetched step
 *     (the server refetches on every navigation, so it's already fresh)
 *   - cached state older than the window → re-read `/v1/onboarding-steps`
 *
 * Once the real step is resolved, if it isn't the one this page serves the
 * user is redirected to the page that matches their step. Steps past
 * SITE_INTELLIGENCE_DONE map to the dashboard via STEP_TO_PAGE.
 */
export function OnboardingGuard({ expectedStep, serverStep }: OnboardingGuardProps) {
  const router = useRouter()
  const { getToken } = useAuth()

  useEffect(() => {
    let cancelled = false

    const redirectIfNeeded = (step: OnboardingStep) => {
      if (!cancelled && step !== expectedStep) {
        router.replace(STEP_TO_PAGE[step])
      }
    }

    const cached = readOnboardingState()

    if (cached && isOnboardingStateFresh(cached, ONBOARDING_STATE_FRESH_MS)) {
      redirectIfNeeded(cached.step)
      return
    }

    if (!cached) {
      // First onboarding visit this session — the server component just read
      // the step, so treat that as our fresh read instead of an extra call.
      writeOnboardingState(serverStep)
      redirectIfNeeded(serverStep)
      return
    }

    // Cached but stale — re-read the step before deciding.
    void (async () => {
      try {
        const { step } = await onboardingRepository.getStep(getToken)
        if (cancelled) return
        writeOnboardingState(step)
        redirectIfNeeded(step)
      } catch {
        // Network hiccup — fall back to the server's step for this render.
        redirectIfNeeded(serverStep)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [expectedStep, serverStep, getToken, router])

  return null
}
