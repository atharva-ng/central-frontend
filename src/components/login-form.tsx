"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Masthead } from "@/components/app/Masthead"
import { GoogleIcon } from "@/components/app/BrandIcons"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-10", className)} {...props}>

      <Masthead phase="Sign in" />

      {/* Lede */}
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
          Welcome back.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign in to continue working on your content.
        </p>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Email
          </Label>
          <Input id="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Password
            </Label>
            <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              Forgot?
            </a>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full mt-1 group">
          Sign in
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-2.5 text-sm font-medium border border-border rounded-lg h-10 px-4 hover:bg-muted/50 hover:border-foreground/20 transition-colors"
      >
        <GoogleIcon className="size-4" />
        Continue with Google
      </button>

      <p className="text-xs text-muted-foreground">
        New here? <a href="/sign-up" className="text-foreground underline underline-offset-4 hover:text-primary">Create an account</a>
      </p>

    </div>
  )
}
