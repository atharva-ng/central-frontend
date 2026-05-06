import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  ONBOARDING_STEPS,
  STEP_TO_PAGE,
  onboardingServerRepository,
} from "@/lib/api/server"
import { AnalyzingClient } from "./analyzing-client"

export default async function AnalyzingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { step, webEntity } = await onboardingServerRepository.getStep()

  // Past the analyzing screen — never re-render it. We only forward; we do
  // not redirect USER_CREATED back to /onboarding here because a fresh form
  // submission lands here with USER_CREATED + a pending payload still in
  // sessionStorage that the client component needs to consume.
  if (
    step === ONBOARDING_STEPS.CONTEXT_CREATED ||
    step === ONBOARDING_STEPS.FINALISED
  ) {
    redirect(STEP_TO_PAGE[step])
  }

  return (
    <AnalyzingClient
      initialStep={step}
      initialWebsiteUrl={webEntity?.websiteUrl ?? null}
    />
  )
}
