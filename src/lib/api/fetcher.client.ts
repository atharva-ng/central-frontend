import {
  request,
  requestWithRetry,
  type FetchOptions,
  type RetryOptions,
} from "./core"

/**
 * Client-side fetch — call from Client Components. Pass `getToken` from
 * `useAuth()` so the caller controls how the token is acquired.
 *
 *   const { getToken } = useAuth()
 *   const data = await apiFetchClient(getToken, "/v1/users/me")
 */
export async function apiFetchClient<T = unknown>(
  getToken: () => Promise<string | null>,
  path: string,
  options: FetchOptions = {},
  retry?: RetryOptions,
): Promise<T> {
  const token = await getToken()
  return retry
    ? requestWithRetry<T>(path, token, options, retry)
    : request<T>(path, token, options)
}
