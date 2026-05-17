import { apiFetchClient, type ClerkTokenGetter } from "../fetcher.client"
import { ROUTES } from "../routes"
import {
  ONBOARDING_STEPS,
  normalizeOnboardingStep,
  type OnboardingStepsResponse,
  type WebEntity,
} from "../onboarding-steps"
import type { PublishingOptions } from "../publishing"
import type { ApiResponse } from "../types"

export type BeginOnboardingPayload = {
  websiteUrl: string
  country: string
}

export type BeginOnboardingResponse = {
  webEntityId: string
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

type RawStepsResponse = ApiResponse<
  Omit<OnboardingStepsResponse, "step"> & { step: string }
>

/**
 * Client-side onboarding API. Methods take Clerk's `getToken` so the repository
 * stays decoupled from the auth provider — pass `useAuth().getToken` from a
 * Client Component.
 *
 * Errors propagate as `ApiError` (status set) or `NetworkError`; let the
 * caller decide how to surface them.
 */
export const onboardingRepository = {
  /**
   * Kicks off the URL/competitor analysis on the backend.
   *
   * Idempotent on the backend: if the user already has a webentity, the
   * existing ID is returned and no analysis is replayed.
   */
  async begin(
    getToken: ClerkTokenGetter,
    payload: BeginOnboardingPayload,
  ): Promise<BeginOnboardingResponse> {
    const res = await apiFetchClient<ApiResponse<BeginOnboardingResponse>>(
      getToken,
      ROUTES.onboarding.begin,
      { method: "POST", body: payload },
    )
    return res.data
  },

  /**
   * Patches the webentity's business context / competitors and (optionally)
   * flips the finalised flag in the same atomic call. Once finalised, further
   * patches return 403 (ErrWebEntityFinalised).
   */
  async patchWebEntity(
    getToken: ClerkTokenGetter,
    payload: PatchWebEntityPayload,
  ): Promise<PatchWebEntityResponse> {
    const res = await apiFetchClient<ApiResponse<PatchWebEntityResponse>>(
      getToken,
      ROUTES.onboarding.webEntity,
      { method: "PATCH", body: payload },
    )
    return res.data
  },

  /**
   * Client-side fetch of the user's current onboarding step. Mirrors the
   * server-side `onboardingServerRepository.getStep` (same normalization +
   * unknown-step fallback) so polling stays consistent with server guards.
   */
  async getStep(
    getToken: ClerkTokenGetter,
  ): Promise<OnboardingStepsResponse> {
    const response = await apiFetchClient<RawStepsResponse>(
      getToken,
      ROUTES.onboarding.steps,
    )

    const rawStep = response.data.step
    const normalizedStep = normalizeOnboardingStep(rawStep)
    if (!normalizedStep) {
      console.warn(
        `[onboarding] unknown step "${rawStep}" from ${ROUTES.onboarding.steps}; defaulting to ${ONBOARDING_STEPS.USER_CREATED}`,
      )
      return { ...response.data, step: ONBOARDING_STEPS.USER_CREATED }
    }
    return { ...response.data, step: normalizedStep }
  },

  /**
   * Fetches the current user's web entity. Unlike `getStep`, the backend
   * returns the entity here regardless of onboarding step — used by /settings
   * where the user is past CONTEXT_CREATED and `getStep` therefore omits it.
   */
  async getCurrentWebEntity(
    getToken: ClerkTokenGetter,
  ): Promise<WebEntity> {
    const res = await apiFetchClient<ApiResponse<WebEntity>>(
      getToken,
      ROUTES.onboarding.webEntityMe,
    )
    return res.data
  },

  /**
   * Fetches the static publishing catalog (destinations, modes, cadences)
   * the publishing screen renders. Backed by `constants/publishing.go`.
   */
  async getPublishingOptions(
    getToken: ClerkTokenGetter,
  ): Promise<PublishingOptions> {
    const res = await apiFetchClient<ApiResponse<PublishingOptions>>(
      getToken,
      ROUTES.onboarding.publishingOptions,
    )
    return res.data
  },
}
