import "server-only"
import { auth } from "@clerk/nextjs/server"
import {
  request,
  requestWithRetry,
  type FetchOptions,
  type RetryOptions,
} from "./core"

/**
 * Server-side fetch — use in Server Components, Route Handlers, Server Actions.
 * Pulls the Clerk session token from the request context automatically.
 *
 * Note: Clerk's server-side `getToken()` (the one returned by `auth()`) does
 * *not* accept `skipCache` — that option only exists on the client-side
 * `GetTokenOptions` (see `fetcher.client.ts`) because the browser caches
 * tokens for ~50s. On the server every call reads straight from the current
 * request's session context, so there is no cache to skip. Stale/revoked
 * tokens here surface as 401s from the backend; callers should handle that
 * (see `getOnboardingStep`).
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
  retry?: RetryOptions,
): Promise<T> {
  const { getToken } = await auth()
  const token = await getToken()
  return retry
    ? requestWithRetry<T>(path, token, options, retry)
    : request<T>(path, token, options)
}
