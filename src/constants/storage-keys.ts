import { BRAND } from "./brand"

const ns = BRAND.storageNamespace

export const STORAGE_KEYS = {
  webEntityId: `${ns}.webEntityId`,
  pendingOnboarding: `${ns}.pendingOnboarding`,
  publishingOptions: `${ns}.publishingOptions`,
  sidebarCollapsed: `${BRAND.uiNamespace}:sidebar-collapsed`,
} as const
