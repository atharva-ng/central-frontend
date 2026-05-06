import "server-only"
import { ApiError } from "../core"
import { apiFetch } from "../fetcher.server"
import { ROUTES } from "../routes"
import type { User } from "../types"

/**
 * Server-side users API. Use in Server Components, Route Handlers, and
 * Server Actions.
 */
export const usersRepository = {
  /**
   * Returns the current user's record, or null if the backend hasn't
   * provisioned them yet (Clerk webhook race). Treat null as "new user — send
   * to onboarding."
   *
   * Retries once on 5xx/network errors. 4xx is never retried.
   */
  async getCurrent(): Promise<User | null> {
    try {
      return await apiFetch<User>(
        ROUTES.users.me,
        {},
        { retries: 1, backoffMs: 200 },
      )
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  },
}
