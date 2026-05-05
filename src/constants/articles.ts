export const ARTICLE_TYPES = [
  "How-To Guide",
  "How-To + Comparison",
  "Listicle / Roundup",
  "Alternatives List",
  "What-Is / Definition",
] as const

export type ArticleType = (typeof ARTICLE_TYPES)[number]

export const ARTICLE_IMAGE_POSITIONS = ["thumbnail", "mid-article"] as const

export type ArticleImagePosition = (typeof ARTICLE_IMAGE_POSITIONS)[number]

/** Markdown placeholders used in article content for image insertion points. */
export const ARTICLE_IMAGE_TOKENS: Record<ArticleImagePosition, string> = {
  thumbnail: "{{IMAGE_THUMBNAIL}}",
  "mid-article": "{{IMAGE_MID_ARTICLE}}",
}

/** Hours before a scheduled article's publish date when generation kicks off. */
export const ARTICLE_LOCK_HOURS_BEFORE = 24

/** Inverse, expressed in days, used by addDays(scheduledFor, ARTICLE_LOCK_DAYS_OFFSET). */
export const ARTICLE_LOCK_DAYS_OFFSET = -1

/** Minimum schedule horizon for new articles — needs 24h to research and write. */
export const ARTICLE_MIN_SCHEDULE_DAYS = 1

export const META_TITLE_MAX = 60
export const META_DESC_MAX = 155

/** Max image upload size accepted by the article editor. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export const ARTICLE_DESTINATIONS = ["framer", "manual"] as const

export type ArticleDestination = (typeof ARTICLE_DESTINATIONS)[number]
