"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, ArrowRight, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SectionLede } from "@/components/app/SectionLede"
import { Masthead } from "@/components/app/Masthead"
import { FramerIcon } from "@/components/app/BrandIcons"
import {
  CADENCE_OPTIONS,
  type Cadence,
  type PublishMode,
  type PublishPlatform,
} from "@/constants/publishing"
import { APP_ROUTES } from "@/constants/routes"

type Platform = PublishPlatform | null

interface FormValues {
  framerSiteUrl: string
  framerApiToken: string
}

export default function PublishingPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<Platform>(null)
  const [cadence, setCadence] = useState<Cadence>("10")
  const [publishMode, setPublishMode] = useState<PublishMode>("review")

  const { register } = useForm<FormValues>()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Publishing" step="02 / 02" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-12">
      <div className="mx-auto w-full max-w-xl flex flex-col gap-10">

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Where do articles go?
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pick a destination and a rhythm. You can change either of these later.
          </p>
        </div>

        <form className="flex flex-col gap-12">

          {/* Section A — Destination */}
          <section className="flex flex-col gap-5">
            <SectionLede number="A" label="Destination" />
            <div className="grid grid-cols-2 gap-3">

              <PlatformOption
                selected={platform === "framer"}
                onClick={() => setPlatform("framer")}
                glyph={<FramerIcon className="size-4" />}
                title="Framer"
                hint="Auto-publish via API"
              />
              <PlatformOption
                selected={platform === "manual"}
                onClick={() => setPlatform("manual")}
                glyph={<Clipboard className="size-4" />}
                title="Copy & paste"
                hint="Manual workflow"
              />
            </div>

            {/* Conditional fields */}
            {platform === "framer" && (
              <div className="flex flex-col gap-4 pl-4 border-l-2 border-primary">
                <Field label="Framer site URL">
                  <Input
                    placeholder="https://yoursite.framer.website"
                    {...register("framerSiteUrl")}
                  />
                </Field>
                <Field
                  label="API token"
                  hint={
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      Where to find this ↗
                    </a>
                  }
                >
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    {...register("framerApiToken")}
                  />
                </Field>
              </div>
            )}

            {platform === "manual" && (
              <p className="pl-4 border-l-2 border-primary text-sm text-muted-foreground leading-relaxed">
                No setup needed. Articles will be ready to copy from your dashboard
                when each one is approved.
              </p>
            )}
          </section>

          {/* Section B — Cadence */}
          <section className="flex flex-col gap-5">
            <SectionLede number="B" label="Cadence" />
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Articles per week
              </Label>
              <p className="text-xs text-muted-foreground/80 -mt-0.5">
                Recommended for your domain: 5–10
              </p>
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
            </div>
          </section>

          {/* Section C — Mode */}
          <section className="flex flex-col gap-5">
            <SectionLede number="C" label="When ready" />
            <div className="flex flex-col">
              <ModeOption
                selected={publishMode === "review"}
                onClick={() => setPublishMode("review")}
                title="Review before publishing"
                description="I approve each article before it goes live."
              />
              <ModeOption
                selected={publishMode === "auto"}
                onClick={() => platform !== "manual" && setPublishMode("auto")}
                disabled={platform === "manual"}
                title="Auto-publish"
                description={
                  platform === "manual"
                    ? "Requires a Framer connection."
                    : "Publish automatically on the scheduled date."
                }
              />
            </div>
          </section>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(APP_ROUTES.onboardingProfile)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              disabled={platform === null}
              className="group"
              onClick={() => router.push(APP_ROUTES.onboardingStrategy)}
            >
              Build my strategy
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

        </form>
      </div>
      </main>
    </div>
  )
}

function PlatformOption({
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
