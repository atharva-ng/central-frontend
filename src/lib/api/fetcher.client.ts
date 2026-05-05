import {
  request,
  requestWithRetry,
  type FetchOptions,
  type RetryOptions,
} from "./core"

export type ClerkTokenGetter = (options?: { skipCache?: boolean }) => Promise<string | null>

/**
 * Client-side fetch — call from Client Components. Pass `getToken` from
 * `useAuth()` so the caller controls how the token is acquired.
 *
 *   const { getToken } = useAuth()
 *   const data = await apiFetchClient(getToken, "/v1/users/me")
 */
export async function apiFetchClient<T = unknown>(
  getToken: ClerkTokenGetter,
  path: string,
  options: FetchOptions = {},
  retry?: RetryOptions,
): Promise<T> {
  // Force a fresh Clerk token so we do not forward a cached expired JWT.
  const token = await getToken({ skipCache: true })
  return retry
    ? requestWithRetry<T>(path, token, options, retry)
    : request<T>(path, token, options)
}
