"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TagInput } from "@/components/app/TagInput"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"
import { COUNTRIES } from "@/lib/countries"
import { WEB_ENTITY } from "@/lib/hack2hire"

interface Competitor {
  domain: string
  reason: string
}

const MAX_COMPETITORS = 3

const INITIAL_COMPETITORS: Competitor[] = WEB_ENTITY.competitors.map((c) => ({
  domain: c.url.replace(/^www\./, ""),
  reason: c.reason,
}))

interface FormValues {
  businessName: string
  productDescription: string
  market: string
  brandVoice: string
  wordsToAvoid: string
  icp: string
  icpPain: string
}

export default function ProfilePage() {
  const router = useRouter()
  const ctx = WEB_ENTITY.context
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      businessName: ctx.business_name,
      productDescription: ctx.product_type,
      // target_geography is stored as a label ("Global", "US", etc); the form
      // uses ISO codes — fall back to "US" when no exact match is available.
      market: "US",
      brandVoice: ctx.brand_voice_signals,
      wordsToAvoid: "leverage, synergize, robust, cutting-edge",
      icp: ctx.icp_signals.roles.slice(0, 3).join(", "),
      icpPain: ctx.icp_signals.pain_points[0],
    },
  })

  const [tags, setTags] = useState<string[]>(
    ctx.integrations.length > 0 ? ctx.integrations : ["LeetCode", "Python", "Java", "C++"]
  )
  const [competitors, setCompetitors] = useState<Competitor[]>(INITIAL_COMPETITORS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [newReason, setNewReason] = useState("")

  const businessName = watch("businessName")
  const productDescription = watch("productDescription")
  const canContinue = businessName.trim().length > 0 && productDescription.trim().length > 0
  const competitorsFull = competitors.length >= MAX_COMPETITORS

  function removeCompetitor(domain: string) {
    setCompetitors((prev) => prev.filter((c) => c.domain !== domain))
  }

  const isDomainValid = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(
    newDomain.trim()
  )

  function addCompetitor() {
    if (!isDomainValid || competitorsFull) return
    const domain = newDomain.trim()
    if (!competitors.find((c) => c.domain === domain)) {
      setCompetitors((prev) => [
        ...prev,
        { domain, reason: newReason.trim() || "Added manually for tracking." },
      ])
    }
    setNewDomain("")
    setNewReason("")
    setDialogOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Profile" step="01 / 02" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-12">
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-10">

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Does this match what you do?
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Auto-filled from your site. Edit anything that&apos;s off — this is what
            we&apos;ll use to write your articles.
          </p>
        </div>

        <form className="flex flex-col gap-12">

          {/* Section 1 — Business */}
          <section className="flex flex-col gap-5">
            <SectionLede number="01" label="Business" />
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Business name">
                  <Input {...register("businessName")} />
                </Field>
                <Field label="Primary market">
                  <Select defaultValue="US">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="What your product does">
                <Textarea rows={3} {...register("productDescription")} />
              </Field>
              <Field label="Key integrations" hint="Press Enter or comma to add">
                <TagInput value={tags} onChange={setTags} placeholder="integration" />
              </Field>
            </div>
          </section>

          {/* Section 2 — Customer */}
          <section className="flex flex-col gap-5">
            <SectionLede number="02" label="Customer" />
            <div className="flex flex-col gap-5">
              <Field label="Who you're selling to">
                <Textarea rows={3} {...register("icp")} />
              </Field>
              <Field label="Their biggest pain">
                <Textarea rows={3} {...register("icpPain")} />
              </Field>
            </div>
          </section>

          {/* Section 3 — Competitors */}
          <section className="flex flex-col gap-5">
            <SectionLede number="03" label="Competitors" />
            <p className="text-sm text-muted-foreground -mt-2">
              We surface up to three direct competitors for keyword overlap analysis.
              Remove any that don&apos;t apply.
            </p>

            <div className="flex flex-col">
              {competitors.map((c, idx) => (
                <div
                  key={c.domain}
                  className="group relative flex gap-4 py-4 border-t border-border last:border-b"
                >
                  <span className="font-mono text-[11px] tabular-nums tracking-widest text-primary pt-1 w-6 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <a
                      href={`https://${c.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-sm font-medium tracking-tight hover:text-primary transition-colors w-fit"
                    >
                      {c.domain}
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </a>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {c.reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCompetitor(c.domain)}
                    className="shrink-0 size-7 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all"
                    aria-label={`Remove ${c.domain}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                disabled={competitorsFull}
              >
                + Add competitor
              </Button>
              <span className="font-mono text-[11px] tabular-nums tracking-widest text-muted-foreground">
                {competitors.length} / {MAX_COMPETITORS}
              </span>
            </div>
          </section>

          {/* Section 4 — Voice */}
          <section className="flex flex-col gap-5">
            <SectionLede number="04" label="Voice" />
            <div className="flex flex-col gap-5">
              <Field label="How your content should sound">
                <Textarea rows={3} {...register("brandVoice")} />
              </Field>
              <Field label="Words to never use" hint="Comma-separated">
                <Input {...register("wordsToAvoid")} />
              </Field>
            </div>
          </section>

          {/* Footer rule + buttons */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/onboarding")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              disabled={!canContinue}
              className="group"
              onClick={() => router.push("/onboarding/publishing")}
            >
              Looks right
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

        </form>
      </div>

      {/* Add competitor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a competitor</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Field label="Domain">
              <Input
                placeholder="competitor.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                autoFocus
              />
              {newDomain.length > 0 && !isDomainValid && (
                <p className="text-xs text-destructive">Enter a valid domain (e.g. example.com)</p>
              )}
            </Field>
            <Field label="Why they compete" hint="Optional — helps us tune keyword overlap">
              <Textarea
                rows={3}
                placeholder="What they sell, who they sell to, and where they win in search."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!isDomainValid} onClick={addCompetitor}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </Label>
        {hint && (
          <span className="text-[11px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}
