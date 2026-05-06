/**
 * Client-side auth-cookie sync. Talks to our own Next.js route
 * (`/api/auth/set-token`) that stores the Clerk JWT in an httpOnly cookie so
 * server-side route handlers (the proxy) can authenticate the user.
 *
 * Not routed through `apiFetchClient` because:
 *   - Target is the Next.js app, not the backend (no NEXT_PUBLIC_API_URL).
 *   - We're _setting_ the auth cookie, so we can't depend on it.
 */
export const authRepository = {
  async syncToken(token: string): Promise<void> {
    const res = await fetch("/api/auth/set-token", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) {
      throw new Error(`failed to sync auth token: ${res.status}`)
    }
  },

  async clearToken(): Promise<void> {
    await fetch("/api/auth/set-token", {
      method: "DELETE",
      credentials: "include",
    })
  },
}
