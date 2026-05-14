import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  ONBOARDING_STEPS,
  STEP_TO_PAGE,
  onboardingServerRepository,
} from "@/lib/api/server"
import { StrategyClient } from "./strategy-client"

export default async function StrategyPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { step } = await onboardingServerRepository.getStep()
  if (step !== ONBOARDING_STEPS.FINALISED) redirect(STEP_TO_PAGE[step])

  // The FINALISED step intentionally carries no payload — the strategy screen
  // is a pure progress animation. Competitor domains are no longer surfaced
  // here; the layout's OnboardingGuard handles step gating.
  return <StrategyClient competitorDomains={[]} />
}
