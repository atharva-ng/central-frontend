"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
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
import { APP_ROUTES } from "@/constants/routes"
import { STORAGE_KEYS } from "@/constants/storage-keys"
import { COUNTRIES } from "@/lib/countries"

export function OnboardingForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [countryCode, setCountryCode] = useState("US")
  const [submitting, setSubmitting] = useState(false)

  function stripProtocol(value: string) {
    let next = value.trimStart()
    next = next.replace(/^https:\/\//i, "")
    next = next.replace(/^http:\/\//i, "")
    next = next.replace(/^\/+/, "")
    return next
  }

  function handleSubmit() {
    const trimmed = stripProtocol(url).trim()
    if (!trimmed || submitting) return

    const country = COUNTRIES.find((c) => c.code === countryCode)?.name
    if (!country) {
      toast.error("Pick a primary market.")
      return
    }

    setSubmitting(true)
    try {
      sessionStorage.setItem(
        STORAGE_KEYS.pendingOnboarding,
        JSON.stringify({ websiteUrl: `https://${trimmed}`, country }),
      )
    } catch {
      // sessionStorage may be unavailable; analyzing page will redirect back
      // gracefully if the key is missing.
    }
    router.push(APP_ROUTES.onboardingAnalyzing)
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
          Point us at your website.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We&apos;ll read it, study your competitors, and assemble a keyword strategy
          built around what you actually sell.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="url" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Website
          </Label>
          <div className="flex items-center border-b border-border focus-within:border-foreground transition-colors">
            <span className="font-mono text-sm text-muted-foreground select-none pr-1">https://</span>
            <Input
              id="url"
              type="text"
              placeholder="yoursite.com"
              className="border-0 shadow-none px-0 h-10 text-sm focus-visible:ring-0 bg-transparent"
              value={url}
              onChange={(e) => setUrl(stripProtocol(e.target.value))}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text")
                const cleaned = stripProtocol(pasted)
                if (cleaned !== pasted) {
                  e.preventDefault()
                  setUrl(cleaned)
                }
              }}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="market" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Primary market
          </Label>
          <Select
            value={countryCode}
            onValueChange={(value) => value && setCountryCode(value)}
            disabled={submitting}
          >
            <SelectTrigger
              id="market"
              className="w-full h-10 border-0 border-b border-border rounded-none px-0 shadow-none bg-transparent focus:ring-0 focus:border-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="w-full h-11 group"
          disabled={!url.trim() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Beginning analysis
            </>
          ) : (
            <>
              Begin analysis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          About 30 seconds. We never publish anything without your approval.
        </p>
      </div>
    </div>
  )
}
