import { STORAGE_KEYS } from "@/constants"
import type { PublishingOptions } from "@/lib/api/client"

/**
 * Per-tab cache of the publishing-options catalog. Warmed on /onboarding/profile
 * (the screen before publishing) so /onboarding/publishing renders without a
 * network round-trip. sessionStorage rather than localStorage so a stale
 * catalog can't pin across days — backend remains the source of truth.
 *
 * All accessors are SSR-safe (no-op when window is undefined) and swallow
 * storage failures (private mode, quota, JSON parse) — a missed cache is
 * always recoverable by re-fetching.
 */

const KEY = STORAGE_KEYS.publishingOptions

export function readPublishingOptionsCache(): PublishingOptions | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PublishingOptions
  } catch {
    return null
  }
}

export function writePublishingOptionsCache(opts: PublishingOptions): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(opts))
  } catch {
    // sessionStorage can throw in private mode / quota — non-fatal.
  }
}
