import { apiFetchClient, type ClerkTokenGetter } from "../fetcher.client"
import { ROUTES } from "../routes"
import type { ApiResponse } from "../types"

/** A single planned article on the publish calendar. Mirrors the backend
 *  `dto.ScheduledArticle` shape returned by `/v1/scheduled-articles`. */
export type ScheduledArticleDTO = {
  id: string
  sequenceId: number
  webEntityId: string
  keyword: string
  title?: string
  articleType?: string
  reasoning?: string
  /** RFC3339 — always 00:00 UTC of the publish day. */
  scheduleDate: string
}

export type ScheduledArticlesResponse = {
  /** Inclusive start of the resolved window (RFC3339). */
  from: string
  /** Exclusive end of the resolved window (RFC3339). */
  to: string
  articles: ScheduledArticleDTO[]
}

export type ListScheduledArticlesParams = {
  webEntityId: string
  /** YYYY-MM-DD, inclusive. Omit both `from` and `to` for the current week. */
  from?: string
  /** YYYY-MM-DD, inclusive. */
  to?: string
}

/**
 * Client-side scheduled-articles API — the read side of the publish calendar.
 */
export const scheduledArticlesRepository = {
  /**
   * Lists the scheduled articles for a web entity within [from, to]. When
   * `from`/`to` are omitted the backend returns the current week (Mon–Sun, UTC).
   */
  async list(
    getToken: ClerkTokenGetter,
    params: ListScheduledArticlesParams,
  ): Promise<ScheduledArticlesResponse> {
    const query = new URLSearchParams({ webEntityId: params.webEntityId })
    if (params.from) query.set("from", params.from)
    if (params.to) query.set("to", params.to)

    const res = await apiFetchClient<ApiResponse<ScheduledArticlesResponse>>(
      getToken,
      `${ROUTES.scheduledArticles.list}?${query.toString()}`,
    )
    return res.data
  },
}
