import { APP_ROUTES } from "@/constants"

export const ONBOARDING_STEPS = {
  USER_CREATED: "USER_CREATED",
  WEBENTITY_CREATED: "WEBENTITY_CREATED",
  CONTEXT_CREATED: "CONTEXT_CREATED",
  FINALISED: "FINALISED",
  SITE_INTELLIGENCE_DONE: "SITE_INTELLIGENCE_DONE",
} as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS]
export type RawOnboardingStep = OnboardingStep | "FINALIZED"

export type OnboardingStepsResponse = {
  step: OnboardingStep
  webEntity: WebEntity | null
}

export type WebEntity = {
  id: string
  websiteUrl: string
  countryCode: string
  businessContext?: BusinessContext
  competitors?: Competitor[]
  publishing?: PublishingConfig
  finalised: boolean
  createdAt: string
  updatedAt: string
}

export type PublishingConfig = {
  platform?: string
  apiKey?: string
  articlesPerWeek?: number
  publishMode?: string
}

export type BusinessContext = {
  businessName?: string
  website?: string
  productType?: string
  primaryUseCase?: string
  keyFeatures?: string[]
  integrations?: string[]
  businessModel?: string
  targetGeography?: string
  pricingModel?: string
  keyDifferentiator?: string
  icpSignals?: ICPSignals
  brandVoiceSignals?: string
  inferredFields?: string[]
  userDomainRating?: number
}

export type ICPSignals = {
  roles?: string[]
  industries?: string[]
  companySize?: string
  painPoints?: string[]
}

export type Competitor = {
  domain?: string
  companyName?: string
  reason?: string
}

/**
 * Maps an onboarding step to the page the user belongs on. Used by every
 * onboarding page guard to decide where to redirect when the user's actual
 * step doesn't match the page they're on.
 *
 * `WEBENTITY_CREATED` parks the user on `/onboarding/analyzing` because the
 * backend still owes us context creation; the analyzing page polls
 * `/v1/onboarding-steps` and forwards to `/onboarding/profile` once the step
 * flips to `CONTEXT_CREATED`.
 */
export const STEP_TO_PAGE: Record<OnboardingStep, string> = {
  USER_CREATED: APP_ROUTES.onboarding,
  WEBENTITY_CREATED: APP_ROUTES.onboardingAnalyzing,
  CONTEXT_CREATED: APP_ROUTES.onboardingProfile,
  FINALISED: APP_ROUTES.onboardingStrategy,
  SITE_INTELLIGENCE_DONE: APP_ROUTES.dashboard,
}

const ONBOARDING_STEP_ALIASES: Record<string, OnboardingStep> = {
  FINALIZED: ONBOARDING_STEPS.FINALISED,
}

export function normalizeOnboardingStep(step: string): OnboardingStep | null {
  if (step in STEP_TO_PAGE) return step as OnboardingStep
  return ONBOARDING_STEP_ALIASES[step] ?? null
}
