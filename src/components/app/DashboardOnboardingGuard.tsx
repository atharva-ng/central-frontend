"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { APP_ROUTES, ONBOARDING_STATE_FRESH_MS } from "@/constants"
import { onboardingRepository } from "@/lib/api/client"
import { STEP_TO_PAGE, type OnboardingStep } from "@/lib/api/onboarding-steps"
import {
  isOnboardingStateFresh,
  readOnboardingState,
  writeOnboardingState,
} from "@/lib/api/onboarding-state-cache"

/**
 * Dashboard-side onboarding guard.
 *
 * The dashboard has no server component to gate it the way the onboarding
 * pages do, so the freshness rule has to stand on its own:
 *
 *   - cached state younger than ONBOARDING_STATE_FRESH_MS → trust the cache
 *   - no cache, or stale → re-read `/v1/onboarding-steps`
 *
 * Any step whose STEP_TO_PAGE entry isn't `/dashboard` means the user belongs
 * on an earlier screen — only SITE_INTELLIGENCE_DONE and SCHEDULING_DONE
 * survive the check.
 */
export function DashboardOnboardingGuard() {
  const router = useRouter()
  const { getToken } = useAuth()

  useEffect(() => {
    let cancelled = false

    const redirectIfNeeded = (step: OnboardingStep) => {
      if (cancelled) return
      const target = STEP_TO_PAGE[step]
      if (target !== APP_ROUTES.dashboard) {
        router.replace(target)
      }
    }

    const cached = readOnboardingState()

    if (cached && isOnboardingStateFresh(cached, ONBOARDING_STATE_FRESH_MS)) {
      redirectIfNeeded(cached.step)
      return
    }

    void (async () => {
      try {
        const { step } = await onboardingRepository.getStep(getToken)
        if (cancelled) return
        writeOnboardingState(step)
        redirectIfNeeded(step)
      } catch {
        // Network hiccup — leave the user on /dashboard; the next mount will
        // re-attempt the check.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [getToken, router])

  return null
}
