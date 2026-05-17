import { apiFetchClient, type ClerkTokenGetter } from "../fetcher.client"
import { ROUTES } from "../routes"
import type { ApiResponse } from "../types"

/** Manual-trigger payload for the content generation engine. The backend
 *  resolves keyword id and web-entity-context id from the scheduled article
 *  doc, so the wire only carries the slot id plus optional overrides for
 *  article type and proposed title (defaulted to the persisted values when
 *  omitted). */
export type OrchestratePayload = {
  scheduledArticleId: string
  articleType?: string
  proposedTitle?: string
}

export type OrchestrateResponse = {
  status: string
}

/** Retry payload — only the slot id; title / article type overrides on the
 *  original orchestrate call are not re-applied because the retry's
 *  contract is "run again with whatever the slot currently holds". */
export type RetryPayload = {
  scheduledArticleId: string
}

export const seoBlogRepository = {
  /**
   * Kicks off content generation for a scheduled article. The backend
   * responds 202 with `{ status: "processing" }` and runs the pipeline
   * asynchronously — callers should optimistically flip the article's
   * status and rely on the calendar fetch for the eventual transition.
   */
  async orchestrate(
    getToken: ClerkTokenGetter,
    payload: OrchestratePayload,
  ): Promise<OrchestrateResponse> {
    const res = await apiFetchClient<ApiResponse<OrchestrateResponse>>(
      getToken,
      ROUTES.seoBlog.orchestrate,
      { method: "POST", body: payload },
    )
    return res.data
  },

  /**
   * Re-triggers generation for a scheduled article whose previous run errored.
   * The orchestrate flow on the backend already resets a CGEStatusError master
   * context back to processing, so this endpoint is functionally equivalent to
   * `orchestrate` — separate verb to keep API intent explicit and to leave the
   * door open for retry-specific throttling.
   */
  async retry(
    getToken: ClerkTokenGetter,
    payload: RetryPayload,
  ): Promise<OrchestrateResponse> {
    const res = await apiFetchClient<ApiResponse<OrchestrateResponse>>(
      getToken,
      ROUTES.seoBlog.retry,
      { method: "POST", body: payload },
    )
    return res.data
  },
}
