"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft, ArrowRight, Clipboard, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { cn } from "@/lib/utils"
import { FramerIcon, Masthead, SectionLede } from "@/components/app"
import { APP_ROUTES } from "@/constants"
import { ApiError, onboardingRepository, siteIntelligenceRepository } from "@/lib/api/client"
import type {
  ApiKeyField,
  Cadence,
  PlatformOption,
  PublishingOptions,
  PublishMode,
  PublishPlatform,
  WebEntity,
} from "@/lib/api/client"
import {
  readPublishingOptionsCache,
  writePublishingOptionsCache,
} from "@/lib/publishing-options-cache"

interface PublishingFormProps {
  webEntity: WebEntity
  options: PublishingOptions
}

/**
 * Glyph for each platform. Keyed by the backend's platform id. Anything not
 * registered here falls back to the clipboard glyph so adding a new
 * destination on the backend never crashes the page.
 */
const PLATFORM_GLYPHS: Record<string, React.ReactNode> = {
  framer: <FramerIcon className="size-4" />,
  manual: <Clipboard className="size-4" />,
}

export function PublishingForm({ webEntity, options: initialOptions }: PublishingFormProps) {
  const router = useRouter()
  const { getToken } = useAuth()

  // Prefer the cache warmed by /onboarding/profile when present; otherwise
  // fall back to the server-rendered initial options. After mount we also
  // refresh from cache (or warm it from the initial value) so subsequent
  // visits in the same tab skip the server fetch entirely.
  const [options, setOptions] = useState<PublishingOptions>(
    () => readPublishingOptionsCache() ?? initialOptions,
  )

  useEffect(() => {
    const cached = readPublishingOptionsCache()
    if (cached) {
      setOptions(cached)
    } else {
      writePublishingOptionsCache(initialOptions)
    }
  }, [initialOptions])

  const defaultMode = options.modes[0]?.id ?? ""
  const defaultCadence =
    options.cadences[options.cadences.length - 1]?.value ?? 0

  const [platform, setPlatform] = useState<PublishPlatform | null>(null)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [cadence, setCadence] = useState<Cadence>(defaultCadence)
  const [publishMode, setPublishMode] = useState<PublishMode>(defaultMode)
  const [submitting, setSubmitting] = useState(false)
  const [processError, setProcessError] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const platformOption = useMemo<PlatformOption | null>(
    () => (platform ? options.platforms.find((p) => p.id === platform) ?? null : null),
    [platform, options.platforms],
  )
  const autoSupported = platformOption?.supportsAutoPublish ?? false

  const selectedModeRequiresAuto =
    options.modes.find((m) => m.id === publishMode)?.requiresAutoSupport ?? false
  const effectiveMode: PublishMode =
    selectedModeRequiresAuto && !autoSupported ? defaultMode : publishMode

  const apiKeyReady = (() => {
    if (!platformOption) return false
    if (!platformOption.apiKeyField) return true
    return (apiKeys[platformOption.id] ?? "").trim().length > 0
  })()
  const canSubmit = platform !== null && apiKeyReady && !submitting

  function setApiKey(p: PublishPlatform, value: string) {
    setApiKeys((prev) => ({ ...prev, [p]: value }))
  }

  async function handleConfirm() {
    if (!canSubmit || !platformOption) return
    setSubmitting(true)

    const apiKey = (apiKeys[platformOption.id] ?? "").trim()

    const publishingValue: Record<string, unknown> = {
      platform: platformOption.id,
      articlesPerWeek: cadence,
      publishMode: effectiveMode,
    }
    if (apiKey.length > 0) {
      publishingValue.apiKey = apiKey
    }

    let finalised = false
    try {
      const patchResult = await onboardingRepository.patchWebEntity(getToken, {
        webEntityId: webEntity.id,
        ops: [{ op: "replace", field: "publishing", value: publishingValue }],
        finalise: true,
      })
      finalised = patchResult.finalised
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("This profile is already locked. Refreshing your state.")
        router.refresh()
        return
      }
      const message =
        err instanceof ApiError
          ? `Couldn't save (${err.status}).`
          : "Couldn't reach the server. Check your connection."
      toast.error(message)
      setSubmitting(false)
      return
    }

    if (finalised) {
      try {
        await siteIntelligenceRepository.process(getToken, { webEntityId: webEntity.id })
      } catch {
        setSubmitting(false)
        setProcessError(true)
        return
      }
    }

    router.push(APP_ROUTES.onboardingAnalyzing)
  }

  async function handleRetry() {
    if (retrying) return
    setRetrying(true)
    try {
      await siteIntelligenceRepository.process(getToken, { webEntityId: webEntity.id })
      setProcessError(false)
      router.push(APP_ROUTES.onboardingAnalyzing)
    } catch {
      // user can retry again
    } finally {
      setRetrying(false)
    }
  }

  if (processError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
          <Masthead phase="Publishing" step="02 / 02" className="w-full" />
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
                Something went wrong.
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your publishing settings were saved, but we couldn&apos;t kick off
                the analysis pipeline. This is usually a temporary glitch — try
                again and it should work.
              </p>
            </div>
            <Button className="w-full h-11 group" onClick={handleRetry} disabled={retrying}>
              {retrying ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Retrying…
                </>
              ) : (
                <>
                  <RefreshCw className="size-4 transition-transform group-hover:rotate-180 duration-300" />
                  Try again
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Publishing" step="02 / 02" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-12">
      <div className="mx-auto w-full max-w-xl flex flex-col gap-10">

        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Where do articles go?
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pick a destination and a rhythm. You can change either of these later.
          </p>
        </div>

        <form className="flex flex-col gap-12">

          <section className="flex flex-col gap-5">
            <SectionLede number="A" label="Destination" />
            <div className="grid grid-cols-2 gap-3">
              {options.platforms.map((opt) => (
                <PlatformPick
                  key={opt.id}
                  selected={platform === opt.id}
                  onClick={() => setPlatform(opt.id)}
                  glyph={PLATFORM_GLYPHS[opt.id] ?? <Clipboard className="size-4" />}
                  title={opt.title}
                  hint={opt.hint}
                />
              ))}
            </div>

            {platformOption && (
              <PlatformDetails
                option={platformOption}
                value={apiKeys[platformOption.id] ?? ""}
                onChange={(value) => setApiKey(platformOption.id, value)}
              />
            )}
          </section>

          <section className="flex flex-col gap-5">
            <SectionLede number="B" label="Cadence" />
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Articles per week
              </Label>
              <p className="text-xs text-muted-foreground/80 -mt-0.5">
                Recommended for your domain: 5–10
              </p>
              <Select
                value={String(cadence)}
                onValueChange={(v) => v && setCadence(Number(v))}
              >
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.cadences.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <SectionLede number="C" label="When ready" />
            <div className="flex flex-col">
              {options.modes.map((mode) => {
                const gated = mode.requiresAutoSupport && !autoSupported
                return (
                  <ModeOption
                    key={mode.id}
                    selected={effectiveMode === mode.id}
                    onClick={() => !gated && setPublishMode(mode.id)}
                    disabled={gated}
                    title={mode.title}
                    description={
                      gated
                        ? `Not supported by ${platformOption?.title ?? "this destination"}.`
                        : mode.description
                    }
                  />
                )
              })}
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => router.push(APP_ROUTES.onboardingProfile)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              disabled={!canSubmit}
              className="group"
              onClick={handleConfirm}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  Build my strategy
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
      </main>
    </div>
  )
}

function PlatformDetails({
  option,
  value,
  onChange,
}: {
  option: PlatformOption
  value: string
  onChange: (value: string) => void
}) {
  if (!option.apiKeyField) {
    return option.emptyHelp ? (
      <p className="pl-4 border-l-2 border-primary text-sm text-muted-foreground leading-relaxed">
        {option.emptyHelp}
      </p>
    ) : null
  }

  return (
    <div className="flex flex-col gap-4 pl-4 border-l-2 border-primary">
      <ApiKeyInput field={option.apiKeyField} value={value} onChange={onChange} />
    </div>
  )
}

function ApiKeyInput({
  field,
  value,
  onChange,
}: {
  field: ApiKeyField
  value: string
  onChange: (v: string) => void
}) {
  const inputType = field.type === "password" ? "password" : "text"
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {field.label}
        </Label>
        {field.helpHref && (
          <a
            href={field.helpHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Where to find this ↗
          </a>
        )}
      </div>
      <Input
        type={inputType}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function PlatformPick({
  selected,
  onClick,
  glyph,
  title,
  hint,
}: {
  selected: boolean
  onClick: () => void
  glyph: React.ReactNode
  title: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-4 rounded-lg border p-4 text-left transition-all",
        selected
          ? "border-foreground bg-card"
          : "border-border bg-card hover:border-foreground/30"
      )}
    >
      <div
        className={cn(
          "size-9 rounded-md flex items-center justify-center border transition-colors",
          selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-foreground"
        )}
      >
        {glyph}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
    </button>
  )
}

function ModeOption({
  selected,
  onClick,
  disabled,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  disabled?: boolean
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-start gap-4 py-4 px-1 border-t border-border last:border-b text-left transition-colors",
        !disabled && "hover:bg-muted/40",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "mt-0.5 size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected ? "border-foreground" : "border-border"
        )}
      >
        {selected && <span className="size-2 rounded-full bg-foreground" />}
      </span>
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
      </div>
    </button>
  )
}
