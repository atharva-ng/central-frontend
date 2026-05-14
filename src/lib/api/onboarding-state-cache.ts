import { STORAGE_KEYS } from "@/constants"
import type { OnboardingStep } from "./onboarding-steps"

/**
 * Session-scoped cache of the user's last-known onboarding step. The
 * OnboardingGuard reads this on every onboarding-page visit so rapid
 * client-side navigation between onboarding screens doesn't re-hit
 * `/v1/onboarding-steps` on every hop — see ONBOARDING_STATE_FRESH_MS.
 */
export type CachedOnboardingState = {
  step: OnboardingStep
  /** epoch ms when this step was read from the backend. */
  fetchedAt: number
}

export function readOnboardingState(): CachedOnboardingState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.onboardingState)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CachedOnboardingState>
    if (typeof parsed.step !== "string" || typeof parsed.fetchedAt !== "number") {
      return null
    }
    return { step: parsed.step as OnboardingStep, fetchedAt: parsed.fetchedAt }
  } catch {
    return null
  }
}

export function writeOnboardingState(step: OnboardingStep): void {
  try {
    const state: CachedOnboardingState = { step, fetchedAt: Date.now() }
    sessionStorage.setItem(STORAGE_KEYS.onboardingState, JSON.stringify(state))
  } catch {
    // sessionStorage unavailable — the guard falls back to a fresh read.
  }
}

export function isOnboardingStateFresh(
  state: CachedOnboardingState,
  freshMs: number,
): boolean {
  return Date.now() - state.fetchedAt < freshMs
}
