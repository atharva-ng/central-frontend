import "server-only"
import { redirect } from "next/navigation"
import { ApiError } from "./core"
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
 *
 * On 401 we redirect to /sign-in instead of throwing. This handles the
 * post-sign-out race (the request still carries the just-revoked session
 * cookie, so `auth()` returns a userId but the backend rejects the JWT) as
 * well as exp drift, key rotation, and manual revocation — all of which mean
 * "this user is no longer authenticated to the backend", which is exactly
 * what /sign-in is for. Callers can therefore trust this function to either
 * return a valid step or short-circuit the render via redirect.
 */
export async function getOnboardingStep(): Promise<OnboardingStepsResponse> {
  let response: ApiResponse<Omit<OnboardingStepsResponse, "step"> & { step: string }>
  try {
    response = await apiFetch<ApiResponse<Omit<OnboardingStepsResponse, "step"> & { step: string }>>(
      ROUTES.onboarding.steps,
      {},
      { retries: 1, backoffMs: 200 },
    )
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/sign-in")
    }
    throw err
  }

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
