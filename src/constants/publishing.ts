export const PUBLISH_PLATFORMS = ["framer", "manual"] as const

export type PublishPlatform = (typeof PUBLISH_PLATFORMS)[number]

export const PUBLISH_MODES = ["review", "auto"] as const

export type PublishMode = (typeof PUBLISH_MODES)[number]

export const CADENCE_VALUES = ["3", "5", "10"] as const

export type Cadence = (typeof CADENCE_VALUES)[number]

export const CADENCE_OPTIONS: { value: Cadence; label: string }[] = [
  { value: "3", label: "3 articles per week" },
  { value: "5", label: "5 articles per week" },
  { value: "10", label: "10 articles per week" },
]
