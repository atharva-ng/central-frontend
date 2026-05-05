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
