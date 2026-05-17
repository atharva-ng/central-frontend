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
    webEntityMe: "/v1/web-entity/me",
    publishingOptions: "/v1/publishing-options",
  },
  siteIntelligence: {
    process: "/v1/site-intelligence/process",
    keywordData: "/v1/site-intelligence/keyword-data",
  },
  scheduledArticles: {
    list: "/v1/scheduled-articles",
    article: "/v1/scheduled-articles/article",
    articleDraft: "/v1/scheduled-articles/article/draft",
    articleEdit: "/v1/scheduled-articles/article/edit",
  },
  seoBlog: {
    orchestrate: "/v1/seo-blog/orchestrate",
  },
} as const
