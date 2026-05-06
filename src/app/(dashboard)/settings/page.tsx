import { getOnboardingStep } from "@/lib/api/server"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const { webEntity } = await getOnboardingStep()

  // A fully onboarded user always has a webEntity; the narrowing below satisfies
  // TypeScript. If somehow null (e.g. a race before backend propagates), the
  // client renders with empty defaults which is safe.
  if (!webEntity) {
    // Return client with a minimal skeleton webEntity so the page still renders
    return <SettingsClient webEntity={{ id: "", websiteUrl: "", countryCode: "US", finalised: false, createdAt: "", updatedAt: "" }} />
  }

  return <SettingsClient webEntity={webEntity} />
}
