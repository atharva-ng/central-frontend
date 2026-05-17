"use client"

import { useMemo, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { ChevronDown, ExternalLink, Clipboard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Textarea } from "@/components/ui"
import { FunnelBadge, FramerIcon, OpportunityScore, SectionLede, TagInput, Topbar } from "@/components/app"
import {
  ApiError,
  onboardingRepository,
  setCachedWebEntity,
  toCluster,
  useKeywordData,
  useWebEntity,
  type Cadence,
  type Cluster,
  type PatchOp,
  type PublishingOptions,
  type PublishMode,
  type PublishPlatform as Platform,
  type WebEntity,
} from "@/lib/api/client"
import { COUNTRIES } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface SettingsClientProps {
  options: PublishingOptions
}

export function SettingsClient({ options }: SettingsClientProps) {
  const webEntityState = useWebEntity()

  if (webEntityState.kind === "loading") {
    return <SettingsLoading />
  }
  if (webEntityState.kind === "missing-web-entity") {
    return <SettingsNotice title="No web entity found" body="Finish onboarding to start configuring settings." />
  }
  if (webEntityState.kind === "error") {
    return <SettingsNotice title="Couldn't load settings" body={webEntityState.message} />
  }

  return <SettingsForm webEntity={webEntityState.data} options={options} />
}

function SettingsForm({ webEntity, options }: { webEntity: WebEntity; options: PublishingOptions }) {
  const { getToken } = useAuth()
  const ctx = webEntity.businessContext
  const pub = webEntity.publishing
  const keywordData = useKeywordData()
  const clusters = useMemo<Cluster[]>(() => {
    if (keywordData.kind !== "ready") return []
    return keywordData.data.clusters.map(toCluster)
  }, [keywordData])
  const totalKeywords = clusters.reduce((n, c) => n + 1 + c.supporting.length, 0)

  // Initial values pulled from the loaded entity. The ref below snapshots them
  // so we can diff on save without re-reading state; after a successful save
  // we overwrite the ref so further edits diff against what's now persisted.
  const initial = {
    businessName: ctx?.businessName ?? "",
    productType: ctx?.productType ?? "",
    differentiator: ctx?.keyDifferentiator ?? "",
    market: ctx?.targetGeography ?? "Global",
    businessModel: ctx?.businessModel ?? "",
    integrations: ctx?.integrations ?? [],
    icpRoles: ctx?.icpSignals?.roles ?? [],
    icpPain: ctx?.icpSignals?.painPoints?.[0] ?? "",
    platform: (pub?.platform as Platform | undefined) ?? "manual",
    cadence: (pub?.articlesPerWeek as Cadence | undefined) ?? 10,
    publishMode: (pub?.publishMode as PublishMode | undefined) ?? "review",
    brandVoice: ctx?.brandVoiceSignals ?? "",
  }
  const originalRef = useRef(initial)

  // — Business
  const [businessName, setBusinessName] = useState(initial.businessName)
  // websiteUrl is part of the top-level WebEntity (not businessContext) and is
  // not on the patch whitelist — render it read-only so users don't think they
  // can edit it from settings.
  const websiteUrl = webEntity.websiteUrl
  const [productType, setProductType] = useState(initial.productType)
  const [differentiator, setDifferentiator] = useState(initial.differentiator)
  const [market, setMarket] = useState(initial.market)
  const [businessModel, setBusinessModel] = useState(initial.businessModel)
  const [integrations, setIntegrations] = useState<string[]>(initial.integrations)

  // — Customer
  const [icpRoles, setIcpRoles] = useState<string[]>(initial.icpRoles)
  const [icpPain, setIcpPain] = useState(initial.icpPain)

  // — Publishing
  const [platform, setPlatform] = useState<Platform>(initial.platform)
  // framerUrl is UI-only — the schema has no field for the destination URL,
  // only the apiKey on `publishing`.
  const [framerUrl, setFramerUrl] = useState("")
  const [framerToken, setFramerToken] = useState("")
  // cadence is read-only here — set during onboarding, never mutated from settings.
  const [cadence, setCadence] = useState<Cadence>(initial.cadence)
  const [publishMode, setPublishMode] = useState<PublishMode>(initial.publishMode)

  // — Voice
  const [brandVoice, setBrandVoice] = useState(initial.brandVoice)
  // wordsToAvoid has no backend field yet — local-only string for now.
  const [wordsToAvoid, setWordsToAvoid] = useState(
    "leverage, synergize, robust, cutting-edge"
  )

  const [saving, setSaving] = useState(false)

  const competitors = (webEntity.competitors ?? []).map((c, i) => ({
    domain: (c.domain ?? "").replace(/^www\./, ""),
    company: c.companyName ?? "",
    reason: c.reason ?? "",
    idx: i,
  })).filter((c) => c.domain.length > 0)

  function buildPatchOps(): PatchOp[] {
    const orig = originalRef.current
    const ops: PatchOp[] = []

    const stringField = (field: string, current: string, original: string) => {
      if (current === original) return
      const trimmed = current.trim()
      if (trimmed.length === 0) {
        ops.push({ op: "remove", field })
      } else {
        ops.push({ op: "replace", field, value: trimmed })
      }
    }

    const arrayField = (field: string, current: string[], original: string[]) => {
      if (arraysEqual(current, original)) return
      ops.push({ op: "replace", field, value: current })
    }

    stringField("context.business_name", businessName, orig.businessName)
    stringField("context.product_type", productType, orig.productType)
    stringField("context.key_differentiator", differentiator, orig.differentiator)
    stringField("context.business_model", businessModel, orig.businessModel)
    stringField("context.target_geography", market, orig.market)
    stringField("context.brand_voice_signals", brandVoice, orig.brandVoice)
    arrayField("context.integrations", integrations, orig.integrations)
    arrayField("context.icp_signals.roles", icpRoles, orig.icpRoles)

    // pain_points is a []string in the schema but the form only edits the
    // first entry — preserve the rest when re-uploading.
    const painChanged = icpPain !== orig.icpPain
    if (painChanged) {
      const rest = ctx?.icpSignals?.painPoints?.slice(1) ?? []
      const next = icpPain.trim().length > 0 ? [icpPain.trim(), ...rest] : rest
      ops.push({ op: "replace", field: "context.icp_signals.pain_points", value: next })
    }

    const newToken = framerToken.trim()
    const publishingChanged =
      platform !== orig.platform ||
      publishMode !== orig.publishMode ||
      newToken.length > 0
    if (publishingChanged) {
      // articlesPerWeek is omitted — the server preserves the existing value
      // because it's not editable from settings.
      const value: Record<string, unknown> = {
        platform,
        publishMode,
      }
      if (newToken.length > 0) value.apiKey = newToken
      ops.push({ op: "replace", field: "publishing", value })
    }

    return ops
  }

  async function handleSave() {
    if (saving) return
    const ops = buildPatchOps()
    if (ops.length === 0) {
      toast("Nothing to save")
      return
    }

    setSaving(true)
    try {
      await onboardingRepository.patchWebEntity(getToken, {
        webEntityId: webEntity.id,
        ops,
      })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Couldn't save (${err.status}).`
          : "Couldn't reach the server. Check your connection."
      toast.error(message)
      setSaving(false)
      return
    }

    // Refetch from the server so the cache + diff baseline reflect exactly
    // what was persisted (including any server-side sanitization). The form's
    // local state already shows the typed values; we re-seed it from the
    // fresh entity so any normalization the backend applied is visible.
    let fresh: WebEntity
    try {
      fresh = await onboardingRepository.getCurrentWebEntity(getToken)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Saved, but couldn't refresh (${err.status}).`
          : "Saved, but couldn't refresh from the server."
      toast.error(message)
      setSaving(false)
      return
    }

    setCachedWebEntity(fresh.id, fresh)

    const freshCtx = fresh.businessContext
    const freshPub = fresh.publishing
    const next = {
      businessName: freshCtx?.businessName ?? "",
      productType: freshCtx?.productType ?? "",
      differentiator: freshCtx?.keyDifferentiator ?? "",
      market: freshCtx?.targetGeography ?? "Global",
      businessModel: freshCtx?.businessModel ?? "",
      integrations: freshCtx?.integrations ?? [],
      icpRoles: freshCtx?.icpSignals?.roles ?? [],
      icpPain: freshCtx?.icpSignals?.painPoints?.[0] ?? "",
      platform: (freshPub?.platform as Platform | undefined) ?? "manual",
      cadence: (freshPub?.articlesPerWeek as Cadence | undefined) ?? 10,
      publishMode: (freshPub?.publishMode as PublishMode | undefined) ?? "review",
      brandVoice: freshCtx?.brandVoiceSignals ?? "",
    }
    originalRef.current = next
    setBusinessName(next.businessName)
    setProductType(next.productType)
    setDifferentiator(next.differentiator)
    setMarket(next.market)
    setBusinessModel(next.businessModel)
    setIntegrations(next.integrations)
    setIcpRoles(next.icpRoles)
    setIcpPain(next.icpPain)
    setPlatform(next.platform)
    setCadence(next.cadence)
    setPublishMode(next.publishMode)
    setBrandVoice(next.brandVoice)
    setFramerToken("")
    setSaving(false)
    toast.success("Settings saved")
  }

  return (
    <>
      <Topbar title="Settings" action={<span />} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-12">

          {/* 01 — Business */}
          <section className="flex flex-col gap-5">
            <SectionLede number="01" label="Business" />
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Business name">
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </Field>
                <Field
                  label="Website URL"
                  hint={<span className="text-[11px] text-muted-foreground/70">Read-only</span>}
                >
                  <Input value={websiteUrl} readOnly disabled />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Primary market">
                  <Select value={market} onValueChange={(v) => v && setMarket(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="Global">Global</SelectItem>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Business model">
                  <Input value={businessModel} onChange={(e) => setBusinessModel(e.target.value)} />
                </Field>
              </div>
              <Field label="What your product does">
                <Textarea rows={3} value={productType} onChange={(e) => setProductType(e.target.value)} />
              </Field>
              <Field label="Key differentiator">
                <Textarea rows={3} value={differentiator} onChange={(e) => setDifferentiator(e.target.value)} />
              </Field>
              <Field label="Key integrations" hint="Press Enter or comma to add">
                <TagInput value={integrations} onChange={setIntegrations} placeholder="integration" />
              </Field>
            </div>
          </section>

          {/* 02 — Customer */}
          <section className="flex flex-col gap-5">
            <SectionLede number="02" label="Customer" />
            <div className="flex flex-col gap-5">
              <Field label="Who you're selling to" hint="Press Enter or comma to add">
                <TagInput value={icpRoles} onChange={setIcpRoles} placeholder="role or persona" />
              </Field>
              <Field label="Their biggest pain">
                <Textarea rows={3} value={icpPain} onChange={(e) => setIcpPain(e.target.value)} />
              </Field>
            </div>
          </section>

          {/* 03 — Publishing */}
          <section className="flex flex-col gap-5">
            <SectionLede number="03" label="Publishing" />
            <div className="flex flex-col gap-5">

              {/* Platform picker */}
              <Field label="Platform">
                <div className="grid grid-cols-2 gap-3">
                  <PlatformCard
                    selected={platform === "framer"}
                    onClick={() => setPlatform("framer")}
                    glyph={<FramerIcon className="size-4" />}
                    title="Framer"
                    hint="Auto-publish via API"
                  />
                  <PlatformCard
                    selected={platform === "manual"}
                    onClick={() => setPlatform("manual")}
                    glyph={<Clipboard className="size-4" />}
                    title="Copy & paste"
                    hint="Manual workflow"
                  />
                </div>
              </Field>

              {platform === "framer" && (
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-primary">
                  <Field label="Framer site URL">
                    <Input
                      placeholder="https://yoursite.framer.website"
                      value={framerUrl}
                      onChange={(e) => setFramerUrl(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="API token"
                    hint={
                      <span className="text-[11px] text-muted-foreground/70">
                        Found in Framer → Project settings
                      </span>
                    }
                  >
                    <Input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={framerToken}
                      onChange={(e) => setFramerToken(e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* Articles per week — read-only, set during onboarding */}
              <Field
                label="Articles per week"
                hint={<span className="text-[11px] text-muted-foreground/70">Read-only</span>}
              >
                <Select value={String(cadence)} disabled>
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
              </Field>

              {/* Publish mode */}
              <Field label="When ready">
                <div className="flex flex-col divide-y divide-border border border-border rounded-md overflow-hidden">
                  <ModeRow
                    selected={publishMode === "review"}
                    onClick={() => setPublishMode("review")}
                    title="Review before publishing"
                    description="Approve each article before it goes live."
                  />
                  <ModeRow
                    selected={publishMode === "auto"}
                    onClick={() => setPublishMode("auto")}
                    title="Auto-publish"
                    description="Publish automatically on the scheduled date."
                  />
                </div>
              </Field>

            </div>
          </section>

          {/* 04 — Competitors */}
          <section className="flex flex-col gap-5">
            <SectionLede number="04" label="Competitors" />
            <p className="text-sm text-muted-foreground -mt-2">
              Used for keyword overlap analysis. To update competitors, re-run onboarding.
            </p>
            <div className="flex flex-col">
              {competitors.map((c) => (
                <div
                  key={c.domain}
                  className="flex gap-4 py-4 border-t border-border last:border-b"
                >
                  <span className="font-mono text-[11px] tabular-nums tracking-widest text-primary pt-1 w-6 shrink-0">
                    0{c.idx + 1}
                  </span>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <a
                      href={`https://${c.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-sm font-medium hover:text-primary transition-colors w-fit"
                    >
                      {c.domain}
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </a>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {c.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 05 — Keywords */}
          <section className="flex flex-col gap-5">
            <SectionLede number="05" label="Keywords" />
            {keywordData.kind === "loading" && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}
            {keywordData.kind === "missing-web-entity" && (
              <p className="text-sm text-muted-foreground -mt-2">
                No keyword strategy yet. Finish onboarding to generate clusters.
              </p>
            )}
            {keywordData.kind === "not-ready" && (
              <p className="text-sm text-muted-foreground -mt-2">
                Building your keyword strategy — check back in a moment.
              </p>
            )}
            {keywordData.kind === "error" && (
              <p className="text-sm text-muted-foreground -mt-2">
                {keywordData.message}
              </p>
            )}
            {keywordData.kind === "ready" && (
              <>
                <p className="text-sm text-muted-foreground -mt-2">
                  {totalKeywords} keywords across {clusters.length} cluster
                  {clusters.length !== 1 ? "s" : ""}. Expand a cluster to see its keywords.
                </p>
                <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                  {clusters.map((cluster, i) => (
                    <ClusterAccordion key={`${i}-${cluster.id}`} cluster={cluster} />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* 06 — Voice */}
          <section className="flex flex-col gap-5">
            <SectionLede number="06" label="Voice" />
            <div className="flex flex-col gap-5">
              <Field label="How your content should sound">
                <Textarea rows={4} value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} />
              </Field>
              <Field
                label="Words to never use"
                hint={<span className="text-[11px] text-muted-foreground/70">Comma-separated</span>}
              >
                <Input value={wordsToAvoid} onChange={(e) => setWordsToAvoid(e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end border-t border-border pt-6">
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>

        </div>
      </div>
    </>
  )
}

function ClusterAccordion({ cluster }: { cluster: Cluster }) {
  const [open, setOpen] = useState(false)
  const total = 1 + cluster.supporting.length

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{cluster.name}</span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
            {total} keyword{total !== 1 ? "s" : ""}
          </span>
          {cluster.pillarPublished && (
            <span className="font-mono text-[9px] tracking-widest text-chart-3">
              PILLAR LIVE
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-3">
          <div
            className="grid gap-x-4 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/50 py-1.5 px-1 border-b border-border/50 mb-0.5"
            style={{ gridTemplateColumns: "1fr 72px 42px 58px 60px" }}
          >
            <span>Keyword</span>
            <span className="text-right">Volume</span>
            <span className="text-right">KD</span>
            <span>Funnel</span>
            <span className="text-right">Score</span>
          </div>
          <KeywordRow
            keyword={cluster.pillar.keyword}
            volume={cluster.pillar.volume}
            difficulty={cluster.pillar.difficulty}
            funnel={cluster.pillar.funnel}
            score={cluster.pillar.score}
            isPillar
          />
          {cluster.supporting.map((k) => (
            <KeywordRow
              key={k.keyword}
              keyword={k.keyword}
              volume={k.volume}
              difficulty={k.difficulty}
              funnel={k.funnel}
              score={k.score}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function KeywordRow({
  keyword,
  volume,
  difficulty,
  funnel,
  score,
  isPillar,
}: {
  keyword: string
  volume: number | null
  difficulty: number | null
  funnel: import("@/components/app/FunnelBadge").Funnel
  score: number
  isPillar?: boolean
}) {
  return (
    <div
      className="grid gap-x-4 items-center py-2 px-1 border-b border-border/30 last:border-0"
      style={{ gridTemplateColumns: "1fr 72px 42px 58px 60px" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isPillar && (
          <span className="font-mono text-[9px] tracking-widest text-primary shrink-0">
            PILLAR
          </span>
        )}
        <span
          className={cn(
            "font-mono text-xs truncate",
            isPillar ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {keyword}
        </span>
      </div>
      <span className="font-mono text-xs tabular-nums text-right text-muted-foreground">
        {volume != null ? volume.toLocaleString() : "—"}
      </span>
      <span className="font-mono text-xs tabular-nums text-right text-muted-foreground">
        {difficulty != null ? difficulty : "—"}
      </span>
      <div>
        <FunnelBadge funnel={funnel} />
      </div>
      <div className="flex justify-end">
        <OpportunityScore value={score} size="sm" showInfo={false} />
      </div>
    </div>
  )
}

function PlatformCard({
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
        "flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all",
        selected ? "border-foreground bg-card" : "border-border bg-card hover:border-foreground/30"
      )}
    >
      <div
        className={cn(
          "size-8 rounded-md flex items-center justify-center border transition-colors",
          selected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted border-border text-foreground"
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

function ModeRow({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
    >
      <span
        className={cn(
          "mt-0.5 size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected ? "border-foreground" : "border-border"
        )}
      >
        {selected && <span className="size-2 rounded-full bg-foreground" />}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </Label>
        {hint}
      </div>
      {children}
    </div>
  )
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function SettingsLoading() {
  return (
    <>
      <Topbar title="Settings" action={<span />} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </>
  )
}

function SettingsNotice({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Topbar title="Settings" action={<span />} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="border border-border rounded-lg bg-card px-6 py-12 flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground max-w-sm">{body}</p>
          </div>
        </div>
      </div>
    </>
  )
}
