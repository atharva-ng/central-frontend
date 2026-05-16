import type { WebEntity } from "./onboarding-steps"

/**
 * In-memory cache of the user's web entity, keyed by `webEntityId`. One entry
 * per entity. Module-scoped so it survives client-side navigation. Cleared on
 * hard refresh, which is fine — fresh data anyway.
 *
 * Two writers feed this cache:
 *   - `useWebEntity` — on-demand fetch + cache for client components
 *   - `useOnboardingStepPolling` — warms the cache every successful poll so
 *     the user lands on the dashboard with fresh data already in memory
 *
 * `set` overwrites, so newly-fetched data automatically displaces any stale
 * entry without an explicit invalidation step.
 */
const cache = new Map<string, WebEntity>()

export function getCachedWebEntity(
  webEntityId: string,
): WebEntity | undefined {
  return cache.get(webEntityId)
}

export function setCachedWebEntity(
  webEntityId: string,
  webEntity: WebEntity,
): void {
  cache.set(webEntityId, webEntity)
}

export function clearCachedWebEntity(webEntityId: string): void {
  cache.delete(webEntityId)
}
