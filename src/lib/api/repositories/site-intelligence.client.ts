import { toFunnel, toKeywordStatus, type Funnel, type KeywordStatus } from "@/constants"
import { apiFetchClient, type ClerkTokenGetter } from "../fetcher.client"
import { ROUTES } from "../routes"
import type { ApiResponse } from "../types"

export type { KeywordStatus } from "@/constants/keyword-status"

export type KeywordDTO = {
  keyword: string
  funnel: string
  volume: number
  difficulty: number
  cpc: number
  score: number
  status: string
  scheduledFor: string | null
  manuallyAdded: boolean
}

export type ClusterDTO = {
  id: string
  name: string
  keywordCount: number
  pillarPublished: boolean
  pillar: KeywordDTO
  supporting: KeywordDTO[]
}

export type KeywordDataUsage = {
  manualUsed: number
  manualLimit: number
}

export type KeywordDataResponse = {
  usage: KeywordDataUsage
  totalKeywords: number
  totalClusters: number
  clusters: ClusterDTO[]
}

// UI-layer view of a keyword. Narrows funnel/status to their union types and
// allows volume/difficulty/cpc to be null so screens can render "no data".
export interface ClusterKeyword {
  keyword: string
  funnel: Funnel
  volume: number | null
  difficulty: number | null
  cpc?: number
  score: number
  status: KeywordStatus
  scheduledFor?: string
  manuallyAdded?: boolean
}

export interface Cluster {
  id: string
  name: string
  keywordCount: number
  pillarPublished: boolean
  pillar: ClusterKeyword
  supporting: ClusterKeyword[]
}

export function toClusterKeyword(k: KeywordDTO): ClusterKeyword {
  return {
    keyword: k.keyword,
    funnel: toFunnel(k.funnel),
    volume: k.volume,
    difficulty: k.difficulty,
    cpc: k.cpc || undefined,
    score: Math.round(k.score),
    status: toKeywordStatus(k.status),
    scheduledFor: k.scheduledFor ?? undefined,
    manuallyAdded: k.manuallyAdded || undefined,
  }
}

export function toCluster(c: ClusterDTO): Cluster {
  return {
    id: c.id,
    name: c.name,
    keywordCount: c.keywordCount,
    pillarPublished: c.pillarPublished,
    pillar: toClusterKeyword(c.pillar),
    supporting: c.supporting.map(toClusterKeyword),
  }
}

export type ProcessSiteIntelligencePayload = {
  webEntityId: string
}

export type ProcessSiteIntelligenceResponse = ApiResponse<{ status: string }>

/**
 * Client-side site-intelligence API.
 */
export const siteIntelligenceRepository = {
  /**
   * Kicks off the site-intelligence processing pipeline for the given web
   * entity. Called after the profile is finalised. The pipeline runs
   * asynchronously on the backend; this call only enqueues it.
   *
   * Returns HTTP 202 with `{ success: true, data: { status: "processing" } }`.
   */
  async process(
    getToken: ClerkTokenGetter,
    payload: ProcessSiteIntelligencePayload,
  ): Promise<ProcessSiteIntelligenceResponse> {
    return apiFetchClient<ProcessSiteIntelligenceResponse>(
      getToken,
      ROUTES.siteIntelligence.process,
      { method: "POST", body: payload },
    )
  },

  /**
   * Fetches the materialised keyword/cluster data for a web entity. Returns
   * `KeywordDataResponse` in DTO shape — convert to UI form via `toCluster`.
   */
  async getKeywordData(
    getToken: ClerkTokenGetter,
    webEntityId: string,
  ): Promise<KeywordDataResponse> {
    const path = `${ROUTES.siteIntelligence.keywordData}?webEntityId=${encodeURIComponent(webEntityId)}`
    const res = await apiFetchClient<ApiResponse<KeywordDataResponse>>(getToken, path)
    return res.data
  },
}
