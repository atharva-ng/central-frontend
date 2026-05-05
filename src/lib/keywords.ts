import { FUNNELS, type Funnel } from "@/constants/funnels"
import { INTENT_SCORE_BOOST, INTENTS, type Intent } from "@/constants/intent"
import { MANUAL_KEYWORD_PLAN_LIMIT } from "@/constants/keywords"
import type { KeywordStatus } from "@/constants/keyword-status"

// `Cluster` and `ClusterKeyword` are UI-layer concepts not yet present in the
// backend dump. They wrap the schema-level CompetitorKeyword with
// editorial/lifecycle attributes (funnel, status, score) that the writing
// pipeline produces. When the backend ships clustering, we'll derive these
// from SiteIntelligence rather than hand-rolling them here.

export interface ClusterKeyword {
  keyword: string
  funnel: Funnel
  volume: number | null
  difficulty: number | null
  cpc?: number
  score: number
  /** Lifecycle status of the article tied to this keyword. */
  status: KeywordStatus
  scheduledFor?: string // for "Scheduled for Feb 26"
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

export const CLUSTERS: Cluster[] = [
  {
    id: "system-design",
    name: "System Design Foundations",
    keywordCount: 18,
    pillarPublished: true,
    pillar: {
      keyword: "scalability",
      funnel: "MOFU",
      volume: 18100,
      difficulty: 24,
      cpc: 4.48,
      score: 88,
      status: "generated",
    },
    supporting: [
      { keyword: "what is caching", funnel: "TOFU", volume: 22200, difficulty: 39, cpc: 0.55, score: 84, status: "scheduled", scheduledFor: "May 4" },
      { keyword: "cap theorem", funnel: "MOFU", volume: 6600, difficulty: 18, cpc: 0.16, score: 79, status: "queued" },
      { keyword: "lru cache", funnel: "MOFU", volume: 6600, difficulty: 24, cpc: 1.81, score: 78, status: "queued" },
      { keyword: "websockets", funnel: "TOFU", volume: 9900, difficulty: 50, cpc: 9.62, score: 73, status: "queued" },
      { keyword: "acid transactions", funnel: "MOFU", volume: 6600, difficulty: 20, cpc: 0.59, score: 76, status: "queued" },
      { keyword: "bloom filters", funnel: "MOFU", volume: 5400, difficulty: 33, cpc: 1.61, score: 70, status: "queued" },
      { keyword: "tcp vs udp", funnel: "TOFU", volume: 8100, difficulty: 7, cpc: 0.48, score: 82, status: "queued" },
    ],
  },
  {
    id: "interview-methods",
    name: "Behavioral & Interview Prep",
    keywordCount: 14,
    pillarPublished: false,
    pillar: {
      keyword: "interview star method",
      funnel: "TOFU",
      volume: 60500,
      difficulty: 36,
      cpc: 0.87,
      score: 87,
      status: "scheduled",
      scheduledFor: "May 1",
    },
    supporting: [
      { keyword: "crack coding interview", funnel: "TOFU", volume: 5400, difficulty: 32, cpc: 1.66, score: 75, status: "queued" },
      { keyword: "leetcode patterns", funnel: "MOFU", volume: 5400, difficulty: 28, cpc: 0.66, score: 80, status: "generated" },
    ],
  },
  {
    id: "design-patterns",
    name: "OOP & Design Patterns",
    keywordCount: 12,
    pillarPublished: false,
    pillar: {
      keyword: "design patterns",
      funnel: "MOFU",
      volume: 8100,
      difficulty: 58,
      cpc: 2.73,
      score: 76,
      status: "queued",
    },
    supporting: [
      { keyword: "solid principles", funnel: "MOFU", volume: 9900, difficulty: 25, cpc: 0.98, score: 82, status: "queued" },
      { keyword: "singleton pattern", funnel: "MOFU", volume: 14800, difficulty: 36, cpc: 0.39, score: 81, status: "queued" },
      { keyword: "oop concepts", funnel: "TOFU", volume: 12100, difficulty: 20, cpc: 5.02, score: 79, status: "queued" },
    ],
  },
  {
    id: "dsa-patterns",
    name: "DSA Patterns",
    keywordCount: 9,
    pillarPublished: false,
    pillar: {
      keyword: "prefix tree",
      funnel: "TOFU",
      volume: 8100,
      difficulty: 17,
      cpc: 0.44,
      score: 78,
      status: "queued",
    },
    supporting: [
      { keyword: "master theorem", funnel: "TOFU", volume: 6600, difficulty: 3, cpc: 0.97, score: 84, status: "queued" },
      { keyword: "idempotency", funnel: "MOFU", volume: 40500, difficulty: 21, cpc: 0.14, score: 89, status: "queued" },
    ],
  },
  {
    id: "git-workflow",
    name: "Git for Engineers",
    keywordCount: 8,
    pillarPublished: false,
    pillar: {
      keyword: "git rebase",
      funnel: "TOFU",
      volume: 14800,
      difficulty: 37,
      cpc: 1.59,
      score: 79,
      status: "scheduled",
      scheduledFor: "May 5",
    },
    supporting: [
      { keyword: "git checkout", funnel: "TOFU", volume: 8100, difficulty: 29, cpc: 0.93, score: 74, status: "queued" },
      { keyword: "git pull", funnel: "TOFU", volume: 6600, difficulty: 22, cpc: 0.35, score: 73, status: "queued" },
    ],
  },
  {
    id: "apis-protocols",
    name: "APIs & Protocols",
    keywordCount: 7,
    pillarPublished: false,
    pillar: {
      keyword: "what is an api",
      funnel: "TOFU",
      volume: 49500,
      difficulty: 58,
      cpc: 2.88,
      score: 81,
      status: "queued",
    },
    supporting: [
      { keyword: "json web token", funnel: "MOFU", volume: 22200, difficulty: 57, cpc: 7.25, score: 76, status: "queued" },
      { keyword: "method resolution order", funnel: "TOFU", volume: 22200, difficulty: 14, cpc: 2.64, score: 83, status: "queued" },
      { keyword: "defaultdict python", funnel: "TOFU", volume: 6600, difficulty: 11, cpc: 8.89, score: 77, status: "queued" },
    ],
  },
]

export const PLAN_LIMIT = MANUAL_KEYWORD_PLAN_LIMIT

export interface KeywordLookup {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  intent: Intent
  suggestedFunnel: Funnel
  cluster: string
  score: number
}

/** Dummy keyword data lookup. Returns null for "no data" cases (very short or "obscure" keywords). */
export function lookupKeyword(query: string): KeywordLookup | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  if (q.length < 4 || q.includes("xyz") || q.includes("obscure")) return null

  // Hash-derived dummy stats so the same query produces stable values
  const hash = Array.from(q).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const volume = 200 + ((hash * 17) % 4000)
  const difficulty = 12 + (hash % 30)
  const cpc = +(1.5 + (hash % 80) / 10).toFixed(2)
  const suggestedFunnel = FUNNELS[hash % FUNNELS.length]
  const intent = INTENTS[hash % INTENTS.length]
  const clusters = CLUSTERS.map((c) => c.name)
  const cluster = clusters[hash % clusters.length]

  // 0–100 opportunity score. Volume pulls up; difficulty pulls down; transactional
  // intent gets a small boost. Clamped to 55–95 so scored keywords feel ranking-worthy.
  const intentBoost = INTENT_SCORE_BOOST[intent]
  const raw = 60 + Math.floor(volume / 120) - Math.floor(difficulty * 0.7) + intentBoost
  const score = Math.min(95, Math.max(55, raw))

  return { keyword: q, volume, difficulty, cpc, intent, suggestedFunnel, cluster, score }
}

/** Returns existing keyword across all clusters if a duplicate exists. */
export function findDuplicate(query: string): { cluster: string; entry: ClusterKeyword } | null {
  const q = query.trim().toLowerCase()
  for (const c of CLUSTERS) {
    if (c.pillar.keyword === q) return { cluster: c.name, entry: c.pillar }
    const hit = c.supporting.find((k) => k.keyword === q)
    if (hit) return { cluster: c.name, entry: hit }
  }
  return null
}

export function totalKeywords(): number {
  return CLUSTERS.reduce((acc, c) => acc + c.keywordCount, 0)
}
