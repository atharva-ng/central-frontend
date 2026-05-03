import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Masthead } from "@/components/app/Masthead"
import { getCurrentUser } from "@/lib/api/server"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await getCurrentUser()
  if (user?.onboardingCompletedAt) redirect("/dashboard")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Onboarding" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-16">
        <OnboardingForm />
      </main>
    </div>
  )
}
