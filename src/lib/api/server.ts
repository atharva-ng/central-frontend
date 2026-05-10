import "server-only"

export { ApiError, NetworkError } from "./core"
export { apiFetch } from "./fetcher.server"
export { ROUTES } from "./routes"
export type { ApiResponse, User } from "./types"

// Repositories — server-only data access.
export { onboardingServerRepository } from "./repositories/onboarding.server"
export { usersRepository } from "./repositories/users.server"

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
