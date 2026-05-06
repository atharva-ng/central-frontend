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

  const { step, webEntity } = await onboardingServerRepository.getStep()
  if (step !== ONBOARDING_STEPS.FINALISED) redirect(STEP_TO_PAGE[step])

  const competitorDomains = (webEntity?.competitors ?? [])
    .map((c) => (c.domain ?? "").replace(/^www\./, ""))
    .filter(Boolean)

  return <StrategyClient competitorDomains={competitorDomains} />
}
