import { apiFetchClient } from "./fetcher.client"
import { ROUTES } from "./routes"

export type BeginOnboardingPayload = {
  websiteUrl: string
  country: string
}

/**
 * Kicks off the URL/competitor analysis on the backend. Caller passes
 * Clerk's `getToken` so this stays decoupled from the auth provider.
 *
 * Not retried — POST is non-idempotent. Errors propagate as `ApiError`
 * (status set) or `NetworkError`; let the caller decide how to surface them.
 */
export async function beginOnboarding(
  getToken: () => Promise<string | null>,
  payload: BeginOnboardingPayload,
): Promise<void> {
  await apiFetchClient(getToken, ROUTES.onboarding.begin, {
    method: "POST",
    body: payload,
  })
}
