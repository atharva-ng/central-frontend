"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Masthead } from "@/components/app/Masthead"
import { GoogleIcon } from "@/components/app/BrandIcons"

export function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-10", className)} {...props}>

      <Masthead phase="Sign up" />

      {/* Lede */}
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-[1.15] font-medium tracking-tight">
          Start writing in minutes.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Create an account. We&apos;ll analyze your site and have a strategy
          ready before you finish your coffee.
        </p>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Full name
          </Label>
          <Input id="name" type="text" placeholder="Jane Smith" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Work email
          </Label>
          <Input id="email" type="email" placeholder="jane@company.com" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Password
          </Label>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full mt-1 group">
          Create account
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
        Already have an account? <a href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary">Sign in</a>
      </p>

    </div>
  )
}
