import "server-only"
import { apiFetch } from "./fetcher.server"
import { ROUTES } from "./routes"
import {
  ONBOARDING_STEPS,
  normalizeOnboardingStep,
  type OnboardingStepsResponse,
} from "./onboarding-steps"
import type { ApiResponse } from "./types"

/**
 * Server-side fetch of the user's current onboarding step. Use in Server
 * Components to gate page access — see /onboarding pages and root /.
 *
 * Retries once on 5xx/network. The endpoint is a read so retry is safe.
 */
export async function getOnboardingStep(): Promise<OnboardingStepsResponse> {
  const response = await apiFetch<ApiResponse<Omit<OnboardingStepsResponse, "step"> & { step: string }>>(
    ROUTES.onboarding.steps,
    {},
    { retries: 1, backoffMs: 200 },
  )

  const rawStep = response.data.step
  const normalizedStep = normalizeOnboardingStep(rawStep)
  if (!normalizedStep) {
    // Keep routing stable even if backend returns an unknown step string.
    console.warn(
      `[onboarding] unknown step "${rawStep}" from ${ROUTES.onboarding.steps}; defaulting to ${ONBOARDING_STEPS.USER_CREATED}`,
    )
    return { ...response.data, step: ONBOARDING_STEPS.USER_CREATED }
  }

  if (normalizedStep !== rawStep) {
    console.warn(
      `[onboarding] normalized step "${rawStep}" to "${normalizedStep}" from ${ROUTES.onboarding.steps}`,
    )
  }

  return { ...response.data, step: normalizedStep }
}
