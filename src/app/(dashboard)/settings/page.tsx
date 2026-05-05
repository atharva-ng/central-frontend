"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ExternalLink, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SectionLede } from "@/components/app/SectionLede"
import { Topbar } from "@/components/app/Topbar"
import { FunnelBadge } from "@/components/app/FunnelBadge"
import { OpportunityScore } from "@/components/app/OpportunityScore"
import { TagInput } from "@/components/app/TagInput"
import { FramerIcon } from "@/components/app/BrandIcons"
import {
  CADENCE_OPTIONS,
  type Cadence,
  type PublishMode,
  type PublishPlatform as Platform,
} from "@/constants/publishing"
import { WEB_ENTITY } from "@/lib/hack2hire"
import {
  toCluster,
  useKeywordData,
  type Cluster,
} from "@/lib/api/client"
import { COUNTRIES } from "@/lib/countries"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const ctx = WEB_ENTITY.context
  const keywordData = useKeywordData()
  const clusters = useMemo<Cluster[]>(() => {
    if (keywordData.kind !== "ready") return []
    return keywordData.data.clusters.map(toCluster)
  }, [keywordData])
  const totalKeywords = clusters.reduce((n, c) => n + 1 + c.supporting.length, 0)

  // — Business
  const [businessName, setBusinessName] = useState(ctx.business_name)
  const [websiteUrl, setWebsiteUrl] = useState(WEB_ENTITY.website_url)
  const [productType, setProductType] = useState(ctx.product_type)
  const [differentiator, setDifferentiator] = useState(ctx.key_differentiator)
  const [market, setMarket] = useState("Global")
  const [businessModel, setBusinessModel] = useState(ctx.business_model)
  const [integrations, setIntegrations] = useState<string[]>(
    ctx.integrations.length > 0 ? ctx.integrations : ["LeetCode", "Python", "Java", "C++"]
  )

  // — Customer
  const [icpRoles, setIcpRoles] = useState<string[]>(ctx.icp_signals.roles)
  const [icpPain, setIcpPain] = useState(ctx.icp_signals.pain_points[0])

  // — Publishing
  const [platform, setPlatform] = useState<Platform>("manual")
  const [framerUrl, setFramerUrl] = useState("")
  const [framerToken, setFramerToken] = useState("")
  const [cadence, setCadence] = useState<Cadence>("10")
  const [publishMode, setPublishMode] = useState<PublishMode>("review")

  // — Voice
  const [brandVoice, setBrandVoice] = useState(ctx.brand_voice_signals)
  const [wordsToAvoid, setWordsToAvoid] = useState(
    "leverage, synergize, robust, cutting-edge"
  )

  const competitors = WEB_ENTITY.competitors.map((c, i) => ({
    domain: c.url.replace(/^www\./, ""),
    company: c.company_name,
    reason: c.reason,
    idx: i,
  }))

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
                <Field label="Website URL">
                  <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
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

              {/* Articles per week */}
              <Field label="Articles per week">
                <Select value={cadence} onValueChange={(v) => v && setCadence(v as Cadence)}>
                  <SelectTrigger className="w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CADENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Publish mode — always selectable */}
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
            <Button type="button">Save changes</Button>
          </div>

        </div>
      </div>
    </>
  )
}

function ClusterAccordion({
  cluster,
}: {
  cluster: Cluster
}) {
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
          {/* Column header */}
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
