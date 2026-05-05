import { apiFetchClient } from "./fetcher.client"
import type { ClerkTokenGetter } from "./fetcher.client"
import { ROUTES } from "./routes"
import type { ApiResponse } from "./types"

export type KeywordStatus = "queued" | "scheduled" | "generated"

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

export async function getKeywordData(
  getToken: ClerkTokenGetter,
  webEntityId: string,
): Promise<KeywordDataResponse> {
  const path = `${ROUTES.siteIntelligence.keywordData}?webEntityId=${encodeURIComponent(webEntityId)}`
  const res = await apiFetchClient<ApiResponse<KeywordDataResponse>>(getToken, path)
  return res.data
}
