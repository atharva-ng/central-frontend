/**
 * Single source of truth for backend route paths.
 *
 * Every backend endpoint the frontend talks to MUST be registered here.
 * Grep this file to audit our backend surface area.
 */
export const ROUTES = {
  users: {
    me: "/v1/users/me",
    onboarding: "/v1/users/me/onboarding",
  },
  onboarding: {
    begin: "/v1/onboard",
    steps: "/v1/onboarding-steps",
    webEntity: "/v1/web-entity",
    publishingOptions: "/v1/publishing-options",
  },
  siteIntelligence: {
    process: "/v1/site-intelligence/process",
    keywordData: "/v1/site-intelligence/keyword-data",
  },
} as const
