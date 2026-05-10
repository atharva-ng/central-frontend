/**
 * Publishing options shape — mirrors backend `dto.PublishingOptionsResponse`
 * (constants/publishing.go is the single source of truth).
 *
 * The runtime catalog (which platforms exist, which cadences are allowed) is
 * fetched from `/v1/publishing-options`; these types describe what comes back.
 */

export type PublishPlatform = string
export type PublishMode = string
export type Cadence = number

export type ApiKeyField = {
  label: string
  type?: "text" | "password" | "url"
  placeholder?: string
  helpHref?: string
}

export type PlatformOption = {
  id: PublishPlatform
  title: string
  hint: string
  supportsAutoPublish: boolean
  apiKeyField?: ApiKeyField
  emptyHelp?: string
}

export type PublishModeOption = {
  id: PublishMode
  title: string
  description: string
  /** When true, this mode is only selectable for platforms whose
   *  `supportsAutoPublish` is true. */
  requiresAutoSupport: boolean
}

export type CadenceOption = {
  value: Cadence
  label: string
}

export type PublishingOptions = {
  platforms: PlatformOption[]
  modes: PublishModeOption[]
  cadences: CadenceOption[]
}
