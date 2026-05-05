import { apiFetchClient } from "./fetcher.client"
import type { ClerkTokenGetter } from "./fetcher.client"
import { ROUTES } from "./routes"
import {
  ONBOARDING_STEPS,
  normalizeOnboardingStep,
  type OnboardingStepsResponse,
} from "./onboarding-steps"
import type { ApiResponse } from "./types"

export type BeginOnboardingPayload = {
  websiteUrl: string
  country: string
}

export type BeginOnboardingResponse = {
  webEntityId: string
}

/**
 * Kicks off the URL/competitor analysis on the backend. Caller passes
 * Clerk's `getToken` so this stays decoupled from the auth provider.
 *
 * Idempotent on the backend: if the user already has a webentity, the
 * existing ID is returned and no analysis is replayed.
 *
 * Errors propagate as `ApiError` (status set) or `NetworkError`; let the
 * caller decide how to surface them.
 */
export async function beginOnboarding(
  getToken: ClerkTokenGetter,
  payload: BeginOnboardingPayload,
): Promise<BeginOnboardingResponse> {
  return apiFetchClient<BeginOnboardingResponse>(
    getToken,
    ROUTES.onboarding.begin,
    {
      method: "POST",
      body: payload,
    },
  )
}

export type PatchOp = {
  op: "add" | "remove" | "replace"
  field: string
  index?: number
  value?: unknown
}

export type PatchWebEntityPayload = {
  webEntityId: string
  ops: PatchOp[]
  finalise?: boolean
}

export type PatchWebEntityResponse = {
  webEntityId: string
  applied: number
  finalised: boolean
}

/**
 * Patches the webentity's business context / competitors and (optionally)
 * flips the finalised flag in the same atomic call. Once finalised, further
 * patches return 403 (ErrWebEntityFinalised).
 */
export async function patchWebEntity(
  getToken: ClerkTokenGetter,
  payload: PatchWebEntityPayload,
): Promise<PatchWebEntityResponse> {
  return apiFetchClient<PatchWebEntityResponse>(
    getToken,
    ROUTES.onboarding.webEntity,
    {
      method: "PATCH",
      body: payload,
    },
  )
}

/**
 * Client-side fetch of the user's current onboarding step. Mirrors the
 * server-side `getOnboardingStep` (same normalization + unknown-step
 * fallback) so polling from the analyzing page stays consistent with the
 * server guards used by every onboarding route.
 */
export async function fetchOnboardingStepClient(
  getToken: ClerkTokenGetter,
): Promise<OnboardingStepsResponse> {
  const response = await apiFetchClient<
    ApiResponse<Omit<OnboardingStepsResponse, "step"> & { step: string }>
  >(getToken, ROUTES.onboarding.steps)

  const rawStep = response.data.step
  const normalizedStep = normalizeOnboardingStep(rawStep)
  if (!normalizedStep) {
    console.warn(
      `[onboarding] unknown step "${rawStep}" from ${ROUTES.onboarding.steps}; defaulting to ${ONBOARDING_STEPS.USER_CREATED}`,
    )
    return { ...response.data, step: ONBOARDING_STEPS.USER_CREATED }
  }
  return { ...response.data, step: normalizedStep }
}

export type ProcessSiteIntelligencePayload = {
  webEntityId: string
}

export type ProcessSiteIntelligenceResponse = ApiResponse<{ status: string }>

/**
 * Kicks off the site-intelligence processing pipeline for the given web entity.
 * Called after the profile is finalised. The pipeline runs asynchronously on
 * the backend; this call only enqueues it.
 *
 * Returns HTTP 202 with `{ success: true, data: { status: "processing" } }`.
 */
export async function processSiteIntelligence(
  getToken: ClerkTokenGetter,
  payload: ProcessSiteIntelligencePayload,
): Promise<ProcessSiteIntelligenceResponse> {
  return apiFetchClient<ProcessSiteIntelligenceResponse>(
    getToken,
    ROUTES.siteIntelligence.process,
    {
      method: "POST",
      body: payload,
    },
  )
}
