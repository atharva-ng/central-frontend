import { SignUp } from "@clerk/nextjs"
import { Masthead } from "@/components/app/Masthead"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Create account" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-12 flex items-start justify-center">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              cardBox: "shadow-none",
              card: "bg-card border border-border shadow-none rounded-lg",
              headerTitle: "text-[22px] font-medium tracking-tight",
              headerSubtitle: "text-sm text-muted-foreground",
              socialButtonsBlockButton:
                "border border-border bg-background hover:bg-accent text-foreground normal-case",
              formFieldLabel:
                "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90 normal-case font-medium",
              footerActionLink: "text-primary hover:text-primary/80",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-xs",
            },
          }}
        />
      </main>
    </div>
  )
}
