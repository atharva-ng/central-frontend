import { format, parseISO, startOfWeek } from "date-fns"
import type { ScheduledArticleDTO } from "./repositories/scheduled-articles.client"

/**
 * In-memory cache of scheduled articles, keyed by `(webEntityId, weekStart)`.
 * One entry per Mon-aligned week. An empty array means "we asked the backend
 * and the week is genuinely empty" — distinct from `undefined` (never asked).
 *
 * Module-scoped so it survives client-side navigation between /dashboard and
 * /articles. Cleared on hard refresh, which is fine — fresh data anyway.
 */
const cache = new Map<string, ScheduledArticleDTO[]>()

function key(webEntityId: string, weekStart: string) {
  return `${webEntityId}|${weekStart}`
}

export function getCachedWeek(
  webEntityId: string,
  weekStart: string,
): ScheduledArticleDTO[] | undefined {
  return cache.get(key(webEntityId, weekStart))
}

export function setCachedWeek(
  webEntityId: string,
  weekStart: string,
  articles: ScheduledArticleDTO[],
): void {
  cache.set(key(webEntityId, weekStart), articles)
}

/**
 * Applies a partial update to a cached scheduled article wherever it lives.
 * Used to keep the /articles view in sync with mutations triggered from
 * /dashboard (e.g. "Generate now" flipping status to "generating") without
 * waiting for a refetch.
 */
export function updateCachedArticle(
  articleId: string,
  patch: Partial<ScheduledArticleDTO>,
): void {
  for (const [k, articles] of cache.entries()) {
    const idx = articles.findIndex((a) => a.id === articleId)
    if (idx === -1) continue
    const next = articles.slice()
    next[idx] = { ...next[idx], ...patch }
    cache.set(k, next)
  }
}

/**
 * Buckets fetched articles into their Mon-aligned week bucket. Every week in
 * `weekStarts` ends up represented — empty weeks remain empty arrays so they
 * can be cached as "confirmed empty" rather than re-fetched next time.
 */
export function bucketArticlesByWeek(
  articles: ScheduledArticleDTO[],
  weekStarts: string[],
): Map<string, ScheduledArticleDTO[]> {
  const buckets = new Map<string, ScheduledArticleDTO[]>()
  for (const w of weekStarts) buckets.set(w, [])
  for (const article of articles) {
    const articleDate = parseISO(article.scheduleDate)
    const ws = startOfWeek(articleDate, { weekStartsOn: 1 })
    const k = format(ws, "yyyy-MM-dd")
    const bucket = buckets.get(k)
    if (bucket) bucket.push(article)
  }
  return buckets
}
