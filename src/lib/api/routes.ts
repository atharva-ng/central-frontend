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
  },
} as const
