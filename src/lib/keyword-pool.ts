// Static keyword pool — used by AddArticleSheet's keyword picker.
// Derived from SITE_INTELLIGENCE.keywords.competitor_keywords so the picker
// shows the same data the rest of the app reads from. Once the queue store
// ships, this will become a live query against site_intelligence.

import type { Funnel } from "@/components/app/FunnelBadge"
import { SITE_INTELLIGENCE } from "./hack2hire"

export interface PoolKeyword {
  keyword: string
  cluster: string
  funnel: Funnel
  volume: number
  difficulty: number
  cpc: number
}

// Topical assignment + funnel guess — the writing pipeline assigns these from
// the keyword + intent + ranking_url in production. Hand-rolled here to keep
// the picker realistic.
const ASSIGN: Record<string, { cluster: string; funnel: Funnel }> = {
  "interview star method": { cluster: "Behavioral & Interview Prep", funnel: "TOFU" },
  "what is an api": { cluster: "APIs & Protocols", funnel: "TOFU" },
  "idempotency": { cluster: "DSA Patterns", funnel: "MOFU" },
  "what is caching": { cluster: "System Design Foundations", funnel: "TOFU" },
  "json web token": { cluster: "APIs & Protocols", funnel: "MOFU" },
  "method resolution order": { cluster: "APIs & Protocols", funnel: "TOFU" },
  "scalability": { cluster: "System Design Foundations", funnel: "MOFU" },
  "git rebase": { cluster: "Git for Engineers", funnel: "TOFU" },
  "singleton pattern": { cluster: "OOP & Design Patterns", funnel: "MOFU" },
  "oop concepts": { cluster: "OOP & Design Patterns", funnel: "TOFU" },
  "websockets": { cluster: "System Design Foundations", funnel: "TOFU" },
  "solid principles": { cluster: "OOP & Design Patterns", funnel: "MOFU" },
  "design patterns": { cluster: "OOP & Design Patterns", funnel: "MOFU" },
  "git checkout": { cluster: "Git for Engineers", funnel: "TOFU" },
  "prefix tree": { cluster: "DSA Patterns", funnel: "TOFU" },
  "system design": { cluster: "System Design Foundations", funnel: "MOFU" },
  "tcp vs udp": { cluster: "System Design Foundations", funnel: "TOFU" },
  "acid transactions": { cluster: "System Design Foundations", funnel: "MOFU" },
  "cap theorem": { cluster: "System Design Foundations", funnel: "MOFU" },
  "git pull": { cluster: "Git for Engineers", funnel: "TOFU" },
  "lru cache": { cluster: "System Design Foundations", funnel: "MOFU" },
  "master theorem": { cluster: "DSA Patterns", funnel: "TOFU" },
  "defaultdict python": { cluster: "APIs & Protocols", funnel: "TOFU" },
  "bloom filters": { cluster: "System Design Foundations", funnel: "MOFU" },
  "crack coding interview": { cluster: "Behavioral & Interview Prep", funnel: "TOFU" },
  "leetcode patterns": { cluster: "Behavioral & Interview Prep", funnel: "MOFU" },
}

export const KEYWORD_POOL: PoolKeyword[] = SITE_INTELLIGENCE.keywords.competitor_keywords.map(
  (k) => {
    const a = ASSIGN[k.keyword] ?? { cluster: "Uncategorized", funnel: "MOFU" as const }
    return {
      keyword: k.keyword,
      cluster: a.cluster,
      funnel: a.funnel,
      volume: k.volume,
      difficulty: k.keyword_difficulty,
      cpc: k.cpc ?? 0,
    }
  }
)
