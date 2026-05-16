import type { KeywordDataResponse } from "./repositories/site-intelligence.client"

/**
 * In-memory cache of keyword/cluster data, keyed by `webEntityId`. One entry
 * per web entity — the backend returns the full strategy per entity, so we
 * don't slice further. Module-scoped so it survives client-side navigation
 * between /keywords, /settings, and the AddArticleSheet. Cleared on hard
 * refresh, which is fine — fresh data anyway.
 *
 * `set` overwrites, so newly-fetched data automatically displaces any stale
 * entry without an explicit invalidation step.
 */
const cache = new Map<string, KeywordDataResponse>()

export function getCachedKeywordData(
  webEntityId: string,
): KeywordDataResponse | undefined {
  return cache.get(webEntityId)
}

export function setCachedKeywordData(
  webEntityId: string,
  data: KeywordDataResponse,
): void {
  cache.set(webEntityId, data)
}

export function clearCachedKeywordData(webEntityId: string): void {
  cache.delete(webEntityId)
}
