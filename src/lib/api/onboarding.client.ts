import { apiFetchClient } from "./fetcher.client"
import type { ClerkTokenGetter } from "./fetcher.client"
import { ROUTES } from "./routes"

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
