import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  ONBOARDING_STEPS,
  STEP_TO_PAGE,
  onboardingServerRepository,
} from "@/lib/api/server"

export default async function StrategyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { step } = await onboardingServerRepository.getStep()
  if (step !== ONBOARDING_STEPS.FINALISED) redirect(STEP_TO_PAGE[step])

  return <>{children}</>
}
