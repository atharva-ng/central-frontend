import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/api/server"

export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await getCurrentUser()
  redirect(user?.onboardingCompletedAt ? "/dashboard" : "/onboarding")
}
