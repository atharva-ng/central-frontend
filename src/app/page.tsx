import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { STEP_TO_PAGE, getOnboardingStep } from "@/lib/api/server"

export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { step } = await getOnboardingStep()
  redirect(STEP_TO_PAGE[step])
}
