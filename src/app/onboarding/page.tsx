import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Masthead } from "@/components/app/Masthead"
import { OnboardingGuard } from "@/components/app/OnboardingGuard"
import {
  ONBOARDING_STEPS,
  STEP_TO_PAGE,
  onboardingServerRepository,
} from "@/lib/api/server"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { step, countries } = await onboardingServerRepository.getStep()
  if (step !== ONBOARDING_STEPS.USER_CREATED) redirect(STEP_TO_PAGE[step])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingGuard expectedStep={ONBOARDING_STEPS.USER_CREATED} serverStep={step} />
      <header className="border-b border-border h-14 flex items-center px-8 shrink-0">
        <Masthead phase="Onboarding" className="w-full" />
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-16">
        <OnboardingForm countries={countries ?? []} />
      </main>
    </div>
  )
}
