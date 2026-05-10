export { ApiError, NetworkError } from "./core"
export { apiFetchClient } from "./fetcher.client"
export type { ClerkTokenGetter } from "./fetcher.client"
export { ROUTES } from "./routes"
export type { ApiResponse, User } from "./types"

// Repositories — every backend interaction goes through one of these.
export { authRepository } from "./repositories/auth.client"
export { onboardingRepository } from "./repositories/onboarding.client"
export type {
  BeginOnboardingPayload,
  BeginOnboardingResponse,
  PatchOp,
  PatchWebEntityPayload,
  PatchWebEntityResponse,
} from "./repositories/onboarding.client"
export { siteIntelligenceRepository, toCluster, toClusterKeyword } from "./repositories/site-intelligence.client"
export type {
  Cluster,
  ClusterDTO,
  ClusterKeyword,
  KeywordDTO,
  KeywordDataResponse,
  KeywordDataUsage,
  KeywordStatus,
  ProcessSiteIntelligencePayload,
  ProcessSiteIntelligenceResponse,
} from "./repositories/site-intelligence.client"

// Step taxonomy + types — shared between client and server.
export { ONBOARDING_STEPS, STEP_TO_PAGE } from "./onboarding-steps"
export type {
  BusinessContext,
  Competitor,
  ICPSignals,
  OnboardingStep,
  OnboardingStepsResponse,
  WebEntity,
} from "./onboarding-steps"

// Publishing catalog — backed by `/v1/publishing-options`.
export type {
  ApiKeyField,
  Cadence,
  CadenceOption,
  PlatformOption,
  PublishingOptions,
  PublishMode,
  PublishModeOption,
  PublishPlatform,
} from "./publishing"

// Hooks — bind a repository to a React component lifecycle.
export { useKeywordData } from "./hooks/use-keyword-data"
export type { KeywordDataLoadState } from "./hooks/use-keyword-data"
export { useOnboardingStepPolling } from "./hooks/use-onboarding-step-polling"
