import { apiFetchClient, type ClerkTokenGetter } from "../fetcher.client"
import { ROUTES } from "../routes"
import type { ApiResponse } from "../types"
import type { ArticleStatus } from "@/constants/article-status"

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
  /** User-supplied dashboard guidance threaded into article generation. */
  additionalInstructions?: string
  /** Keyword-derived stats hydrated from the referenced keyword doc. */
  volume: number
  difficulty: number
  cpc: number
  /** TOFU / MOFU / BOFU string. Empty when the keyword has no funnel set. */
  funnel?: string
  intent?: string
  cluster?: string
  /** RFC3339 — always 00:00 UTC of the publish day. */
  scheduleDate: string
  /** Lifecycle label — matches the backend enum string. */
  status: ArticleStatus
  /** Word count of the generated article body — 0 until the pipeline produces content. */
  wordCount: number
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

/** Image entry on a generated article. */
export type ArticleImageDTO = {
  position: string
  s3Key?: string
  alt?: string
}

/** Meta assets (title, description, social excerpt) on a generated article. */
export type ArticleMetaDTO = {
  metaTitle?: string
  metaDescription?: string
  socialExcerpt?: string
}

/** Schema markup blocks (article + FAQ JSON-LD) on a generated article. */
export type ArticleSchemaDTO = {
  articleSchema?: unknown
  faqSchema?: unknown
}

/** Calendar slot paired with any generated content + keyword-derived
 *  analytics + publishing defaults. When the article has not finished
 *  generating, `content` / `meta` / `schema` / `images` are absent and
 *  `wordCount` / `generatedAt` / `schemaGenerated` reflect that. */
export type ArticleDetailDTO = {
  scheduledArticle: ScheduledArticleDTO
  funnel?: string
  cluster?: string
  intent?: string
  opportunityScore: number
  volume: number
  difficulty: number
  cpc: number
  destination?: string
  /** Placeholder strings until the publish flow lands. */
  urlSlug: string
  liveUrl: string
  publishedAt: string
  wordCount: number
  generatedAt?: string
  schemaGenerated: boolean
  content?: string
  meta?: ArticleMetaDTO
  schema?: ArticleSchemaDTO
  images?: ArticleImageDTO[]
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

  /**
   * Fetches a single article (slot + generated content) by its scheduled
   * article id. Returns the slot even when generation hasn't finished — the
   * generated fields will simply be undefined.
   */
  async getByScheduleId(
    getToken: ClerkTokenGetter,
    scheduledArticleId: string,
  ): Promise<ArticleDetailDTO> {
    const query = new URLSearchParams({ scheduledArticleId })
    const res = await apiFetchClient<ApiResponse<ArticleDetailDTO>>(
      getToken,
      `${ROUTES.scheduledArticles.article}?${query.toString()}`,
    )
    return res.data
  },

  /**
   * Persists the user's draft edits and flips the scheduled article status
   * to `draft`. The server takes each field as-is, so the client must send
   * the full intended state of every editable field.
   */
  async saveDraft(
    getToken: ClerkTokenGetter,
    payload: SaveArticleDraftPayload,
  ): Promise<void> {
    await apiFetchClient<ApiResponse<{ status: string }>>(
      getToken,
      ROUTES.scheduledArticles.articleDraft,
      { method: "PATCH", body: payload },
    )
  },

  /**
   * Dashboard sidebar / drag-drop partial edit. Each field is optional —
   * omit a field to leave the persisted value untouched. The backend enforces
   * status-based gating: generating/published reject everything; draft and
   * readyForReview allow only title (+ scheduleDate when the slot is still
   * "non-published"); scheduled allows everything when the current date is
   * still in the future. `scheduleDate` is `YYYY-MM-DD` and interpreted as
   * UTC midnight by the backend.
   */
  async update(
    getToken: ClerkTokenGetter,
    payload: UpdateScheduledArticlePayload,
  ): Promise<void> {
    await apiFetchClient<ApiResponse<{ status: string }>>(
      getToken,
      ROUTES.scheduledArticles.articleEdit,
      { method: "PATCH", body: payload },
    )
  },
}

export type SaveArticleDraftPayload = {
  scheduledArticleId: string
  articleContent: string
  metaTitle: string
  metaDescription: string
  urlSlug: string
}

/**
 * Dashboard partial-edit payload. Every field except `scheduledArticleId` is
 * optional — omit a field to leave the persisted value untouched. Backend
 * gates by status; see scheduledArticlesRepository.update for the rules.
 */
export type UpdateScheduledArticlePayload = {
  scheduledArticleId: string
  title?: string
  articleType?: string
  additionalInstructions?: string
  /** YYYY-MM-DD — backend interprets as UTC midnight. */
  scheduleDate?: string
}
