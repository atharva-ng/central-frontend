import { onboardingServerRepository } from "@/lib/api/server"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  // Only the static publishing catalog is server-fetched; the web entity is
  // pulled client-side via `useWebEntity` so the cache lives in module state
  // and survives re-navigations to /settings without a refetch.
  const options = await onboardingServerRepository.getPublishingOptions()
  return <SettingsClient options={options} />
}
