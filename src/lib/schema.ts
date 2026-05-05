// Backend-mirroring types. These match the MongoDB document shape exactly so
// when the API gets wired in, payloads can be consumed without translation.
//
// Two collections are reflected here:
//   - web_entities       (onboarding doc — business profile + competitors)
//   - site_intelligence  (per-entity keyword research output)
//
// Mongo wire format quirks ($oid, $date) are preserved as opaque wrappers.

export type MongoObjectId = { $oid: string }
export type MongoDate = { $date: string }

import type { Intent } from "@/constants"
export type { Intent }

// ── web_entities ────────────────────────────────────────────────────────────

export interface IcpSignals {
  roles: string[]
  industries: string[]
  company_size: string
  pain_points: string[]
}

export interface BusinessContext {
  brand_voice_signals: string
  business_model: string
  business_name: string
  icp_signals: IcpSignals
  inferred_fields: string[]
  integrations: string[]
  key_differentiator: string
  key_features: string[]
  pricing_model: string
  primary_use_case: string
  product_type: string
  target_geography: string
  website: string
  user_domain_rating: number
}

export interface Competitor {
  url: string
  company_name: string
  reason: string
}

export interface WebEntity {
  _id: MongoObjectId
  user_id: string
  website_url: string
  created_at: MongoDate
  updated_at: MongoDate
  context: BusinessContext
  competitors: Competitor[]
}

// ── site_intelligence ───────────────────────────────────────────────────────

export interface CompetitorKeyword {
  keyword: string
  description: string
  volume: number
  cpc?: number
  keyword_difficulty: number
  ranking_position: number
  ranking_url: string
  intent: Intent
}

export interface SiteIntelligence {
  _id: MongoObjectId
  user_id: string
  web_entity_id: string
  keywords: {
    competitor_keywords: CompetitorKeyword[]
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Strip protocol + trailing slash from a website_url for display. */
export function displayDomain(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}
