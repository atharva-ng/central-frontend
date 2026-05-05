export const ONBOARDING_STEPS = {
  USER_CREATED: "USER_CREATED",
  WEBENTITY_CREATED: "WEBENTITY_CREATED",
  FINALISED: "FINALISED",
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
  finalised: boolean
  createdAt: string
  updatedAt: string
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
 */
export const STEP_TO_PAGE: Record<OnboardingStep, string> = {
  USER_CREATED: "/onboarding",
  WEBENTITY_CREATED: "/onboarding/profile",
  FINALISED: "/onboarding/strategy",
}

const ONBOARDING_STEP_ALIASES: Record<string, OnboardingStep> = {
  FINALIZED: ONBOARDING_STEPS.FINALISED,
}

export function normalizeOnboardingStep(step: string): OnboardingStep | null {
  if (step in STEP_TO_PAGE) return step as OnboardingStep
  return ONBOARDING_STEP_ALIASES[step] ?? null
}
