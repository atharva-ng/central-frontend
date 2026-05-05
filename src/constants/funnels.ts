export const FUNNELS = ["TOFU", "MOFU", "BOFU"] as const

export type Funnel = (typeof FUNNELS)[number]

export const VALID_FUNNELS: ReadonlySet<Funnel> = new Set(FUNNELS)

export function toFunnel(value: string, fallback: Funnel = "TOFU"): Funnel {
  return VALID_FUNNELS.has(value as Funnel) ? (value as Funnel) : fallback
}

export const FUNNEL_BADGE_CLASS: Record<Funnel, string> = {
  TOFU: "border-chart-1/40 bg-chart-1/10 text-chart-3",
  MOFU: "border-primary/30 bg-primary/10 text-primary",
  BOFU: "border-foreground/30 bg-foreground/5 text-foreground",
}

export const FUNNEL_FILTER_OPTIONS = ["All", ...FUNNELS] as const
export type FunnelFilter = (typeof FUNNEL_FILTER_OPTIONS)[number]
