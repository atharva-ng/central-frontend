"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
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
import { COUNTRIES } from "@/lib/countries"
import { Masthead } from "@/components/app/Masthead"

export default function OnboardingPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Onboarding" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-16">
      <div className="w-full max-w-md mx-auto flex flex-col gap-10">

        {/* Lede */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
            Point us at your website.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ll read it, study your competitors, and assemble a keyword strategy
            built around what you actually sell.
          </p>
        </div>

        {/* Form — no card wrapper, fields live on the canvas */}
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
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="market" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Primary market
            </Label>
            <Select defaultValue="US">
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

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Button
            className="w-full h-11 group"
            disabled={!url.trim()}
            onClick={() => router.push("/onboarding/analyzing")}
          >
            Begin analysis
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <p className="text-xs text-muted-foreground">
            About 30 seconds. We never publish anything without your approval.
          </p>
        </div>

      </div>
      </main>
    </div>
  )
}
