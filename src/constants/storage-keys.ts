import { BRAND } from "./brand"

const ns = BRAND.storageNamespace

export const STORAGE_KEYS = {
  webEntityId: `${ns}.webEntityId`,
  pendingOnboarding: `${ns}.pendingOnboarding`,
  sidebarCollapsed: `${BRAND.uiNamespace}:sidebar-collapsed`,
} as const
