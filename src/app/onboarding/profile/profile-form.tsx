"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, X } from "lucide-react"
import { toast } from "sonner"
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
import { ApiError, patchWebEntity } from "@/lib/api/client"
import type { WebEntity } from "@/lib/api/client"

interface Competitor {
  domain: string
  reason: string
}

const MAX_COMPETITORS = 3

interface FormValues {
  businessName: string
  productDescription: string
  market: string
  brandVoice: string
  wordsToAvoid: string
  icp: string
  icpPain: string
}

const WEB_ENTITY_ID_KEY = "blogengine.webEntityId"

interface ProfileFormProps {
  webEntity: WebEntity
}

export function ProfileForm({ webEntity }: ProfileFormProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const ctx = webEntity.businessContext
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      businessName: ctx?.businessName ?? "",
      productDescription: ctx?.productType ?? "",
      market: webEntity.countryCode ?? "US",
      brandVoice: ctx?.brandVoiceSignals ?? "",
      wordsToAvoid: "",
      icp: ctx?.icpSignals?.roles?.slice(0, 3).join(", ") ?? "",
      icpPain: ctx?.icpSignals?.painPoints?.[0] ?? "",
    },
  })

  // Keep localStorage in sync with the server-confirmed webEntityId. Other
  // pages read from localStorage as a cache; the steps API is the truth.
  useEffect(() => {
    try {
      window.localStorage.setItem(WEB_ENTITY_ID_KEY, webEntity.id)
    } catch {
      // localStorage can throw in private mode / quota — non-fatal.
    }
  }, [webEntity.id])

  const [tags, setTags] = useState<string[]>(
    ctx?.integrations && ctx.integrations.length > 0 ? ctx.integrations : [],
  )
  const [competitors, setCompetitors] = useState<Competitor[]>(
    (webEntity.competitors ?? []).map((c) => ({
      domain: c.domain ?? "",
      reason: c.reason ?? "",
    })).filter((c) => c.domain.length > 0),
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [newReason, setNewReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const businessName = watch("businessName")
  const productDescription = watch("productDescription")
  const canContinue =
    businessName.trim().length > 0 && productDescription.trim().length > 0 && !submitting
  const competitorsFull = competitors.length >= MAX_COMPETITORS

  function removeCompetitor(domain: string) {
    setCompetitors((prev) => prev.filter((c) => c.domain !== domain))
  }

  const isDomainValid = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(
    newDomain.trim(),
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

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    try {
      // Form-data PATCH ops aren't wired here yet — the form reads from a
      // static fixture. The atomic finalise call still flips the lock so
      // downstream pages see the right step.
      await patchWebEntity(getToken, {
        webEntityId: webEntity.id,
        ops: [],
        finalise: true,
      })
      router.push("/onboarding/analyzing")
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
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Profile" step="01 / 02" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-12">
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-10">
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
            <section className="flex flex-col gap-5">
              <SectionLede number="01" label="Business" />
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Business name">
                    <Input {...register("businessName")} />
                  </Field>
                  <Field label="Primary market">
                    <Select defaultValue={webEntity.countryCode ?? "US"}>
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

            <div className="flex items-center justify-between border-t border-border pt-6">
              <Button type="button" variant="ghost" disabled={submitting}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="button"
                disabled={!canContinue}
                onClick={handleConfirm}
                className="group"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    Looks right
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

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
