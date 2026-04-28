import type { Funnel } from "@/components/app/FunnelBadge"

export interface ClusterKeyword {
  keyword: string
  funnel: Funnel
  volume: number | null
  difficulty: number | null
  cpc?: number
  score: number
  /** Lifecycle status of the article tied to this keyword. */
  status: "generated" | "scheduled" | "queued"
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
    id: "salesforce-sheets",
    name: "Salesforce + Sheets",
    keywordCount: 22,
    pillarPublished: true,
    pillar: {
      keyword: "salesforce google sheets integration",
      funnel: "BOFU",
      volume: 1900,
      difficulty: 24,
      cpc: 6.4,
      score: 89,
      status: "generated",
    },
    supporting: [
      { keyword: "sync salesforce to google sheets", funnel: "BOFU", volume: 590, difficulty: 19, score: 82, status: "scheduled", scheduledFor: "Feb 26" },
      { keyword: "export salesforce reports to google sheets", funnel: "BOFU", volume: 480, difficulty: 17, score: 78, status: "queued" },
      { keyword: "salesforce google sheets addon", funnel: "BOFU", volume: 390, difficulty: 15, score: 74, status: "queued" },
      { keyword: "how to connect salesforce to google sheets", funnel: "TOFU", volume: 720, difficulty: 20, score: 71, status: "queued" },
      { keyword: "real time salesforce data in google sheets", funnel: "BOFU", volume: 260, difficulty: 18, score: 68, status: "queued" },
    ],
  },
  {
    id: "hubspot-sheets",
    name: "HubSpot + Sheets",
    keywordCount: 16,
    pillarPublished: false,
    pillar: {
      keyword: "hubspot google sheets integration",
      funnel: "BOFU",
      volume: 1100,
      difficulty: 22,
      cpc: 5.4,
      score: 84,
      status: "scheduled",
      scheduledFor: "Mar 3",
    },
    supporting: [
      { keyword: "hubspot to google sheets sync", funnel: "BOFU", volume: 480, difficulty: 18, score: 76, status: "queued" },
      { keyword: "export hubspot contacts to google sheets", funnel: "BOFU", volume: 320, difficulty: 16, score: 70, status: "queued" },
    ],
  },
  {
    id: "sheets-automation",
    name: "Sheets Automation",
    keywordCount: 31,
    pillarPublished: true,
    pillar: {
      keyword: "automate google sheets",
      funnel: "TOFU",
      volume: 3200,
      difficulty: 31,
      cpc: 3.1,
      score: 91,
      status: "generated",
    },
    supporting: [
      { keyword: "google sheets automation tools", funnel: "MOFU", volume: 1400, difficulty: 24, score: 80, status: "queued" },
      { keyword: "what is a data connector for google sheets", funnel: "TOFU", volume: 390, difficulty: 14, score: 67, status: "queued" },
    ],
  },
  {
    id: "alternatives",
    name: "Alternatives",
    keywordCount: 19,
    pillarPublished: false,
    pillar: {
      keyword: "supermetrics alternatives",
      funnel: "MOFU",
      volume: 1100,
      difficulty: 18,
      cpc: 4.2,
      score: 85,
      status: "scheduled",
      scheduledFor: "Feb 24",
    },
    supporting: [
      { keyword: "coefficient alternatives", funnel: "MOFU", volume: 880, difficulty: 29, score: 73, status: "queued" },
      { keyword: "zapier alternatives for google sheets", funnel: "MOFU", volume: 720, difficulty: 27, score: 70, status: "queued" },
    ],
  },
  {
    id: "use-case-sales",
    name: "Use Case: Sales",
    keywordCount: 24,
    pillarPublished: false,
    pillar: {
      keyword: "google sheets for sales reporting",
      funnel: "MOFU",
      volume: 590,
      difficulty: 22,
      cpc: 3.9,
      score: 75,
      status: "queued",
    },
    supporting: [],
  },
  {
    id: "stripe-sheets",
    name: "Stripe + Sheets",
    keywordCount: 11,
    pillarPublished: false,
    pillar: {
      keyword: "stripe data to google sheets",
      funnel: "MOFU",
      volume: 390,
      difficulty: 16,
      cpc: 4.7,
      score: 72,
      status: "queued",
    },
    supporting: [
      { keyword: "pull stripe data into google sheets", funnel: "BOFU", volume: 320, difficulty: 18, score: 66, status: "queued" },
    ],
  },
]

export const PLAN_LIMIT = 10

export interface KeywordLookup {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  intent: string
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
  const funnels: Funnel[] = ["TOFU", "MOFU", "BOFU"]
  const suggestedFunnel = funnels[hash % 3]
  const intents = ["informational", "transactional", "commercial", "navigational"]
  const intent = intents[hash % intents.length]
  const clusters = CLUSTERS.map((c) => c.name)
  const cluster = clusters[hash % clusters.length]

  // 0–100 opportunity score. Volume pulls up; difficulty pulls down; transactional
  // intent gets a small boost. Clamped to 55–95 so scored keywords feel ranking-worthy.
  const intentBoost = intent === "transactional" ? 8 : intent === "commercial" ? 5 : 2
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
