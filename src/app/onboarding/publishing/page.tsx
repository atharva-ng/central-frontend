import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { OnboardingGuard } from "@/components/app/OnboardingGuard"
import {
  ONBOARDING_STEPS,
  STEP_TO_PAGE,
  onboardingServerRepository,
} from "@/lib/api/server"
import { PublishingForm } from "./publishing-form"

export default async function PublishingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [{ step, webEntity }, options] = await Promise.all([
    onboardingServerRepository.getStep(),
    onboardingServerRepository.getPublishingOptions(),
  ])
  if (step !== ONBOARDING_STEPS.CONTEXT_CREATED) redirect(STEP_TO_PAGE[step])

  if (!webEntity) redirect(STEP_TO_PAGE[ONBOARDING_STEPS.USER_CREATED])

  return (
    <>
      <OnboardingGuard expectedStep={ONBOARDING_STEPS.CONTEXT_CREATED} serverStep={step} />
      <PublishingForm webEntity={webEntity} options={options} />
    </>
  )
}
