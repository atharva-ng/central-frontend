import { onboardingServerRepository } from "@/lib/api/server"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const [{ webEntity }, options] = await Promise.all([
    onboardingServerRepository.getStep(),
    onboardingServerRepository.getPublishingOptions(),
  ])

  // A fully onboarded user always has a webEntity; the narrowing below satisfies
  // TypeScript. If somehow null (e.g. a race before backend propagates), the
  // client renders with empty defaults which is safe.
  if (!webEntity) {
    return (
      <SettingsClient
        webEntity={{ id: "", websiteUrl: "", countryCode: "US", finalised: false, createdAt: "", updatedAt: "" }}
        options={options}
      />
    )
  }

  return <SettingsClient webEntity={webEntity} options={options} />
}
