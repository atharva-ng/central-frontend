export const INTENTS = [
  "informational",
  "commercial",
  "navigational",
  "transactional",
] as const

export type Intent = (typeof INTENTS)[number]

/** Opportunity-score boost applied per intent in keyword scoring. */
export const INTENT_SCORE_BOOST: Record<Intent, number> = {
  transactional: 8,
  commercial: 5,
  informational: 2,
  navigational: 2,
}
