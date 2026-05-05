import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  ONBOARDING_STEPS,
  STEP_TO_PAGE,
  getOnboardingStep,
} from "@/lib/api/server"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { step, webEntity } = await getOnboardingStep()
  if (step !== ONBOARDING_STEPS.CONTEXT_CREATED) redirect(STEP_TO_PAGE[step])

  // Step is CONTEXT_CREATED so a webentity must exist; satisfy TS narrowing.
  if (!webEntity) redirect(STEP_TO_PAGE[ONBOARDING_STEPS.USER_CREATED])

  return <ProfileForm webEntity={webEntity} />
}
