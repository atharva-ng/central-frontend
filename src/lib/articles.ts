import { addDays, differenceInHours, format, formatDistanceToNowStrict, isBefore, parseISO, startOfDay } from "date-fns"
import type { ArticleStatus } from "@/components/app/StatusBadge"

export interface Article {
  id: string
  title: string
  keyword: string
  funnel: "TOFU" | "MOFU" | "BOFU"
  volume: number
  difficulty: number
  cpc: number
  type: string
  status: ArticleStatus
  scheduledFor: string // ISO yyyy-mm-dd
}

export const ARTICLE_TYPES = [
  "How-To + Comparison",
  "Alternatives List",
  "Listicle / Roundup",
  "How-To Guide",
  "What-Is / Definition",
]

// Dummy data anchored to "today" (2026-04-27, Mon). The dev preview reads `new Date()`
// at render so the relative status badges stay coherent across week navigation.
const today = startOfDay(new Date())

export const SEED_ARTICLES: Article[] = [
  {
    id: "art_005",
    title: "9 Best Google Sheets Add-Ons for Automating Your Data",
    keyword: "best google sheets add-ons",
    funnel: "MOFU",
    volume: 2100,
    difficulty: 27,
    cpc: 3.8,
    type: "Listicle / Roundup",
    status: "published",
    scheduledFor: format(addDays(today, -3), "yyyy-MM-dd"),
  },
  {
    id: "art_001",
    title: "Salesforce Google Sheets Integration: 4 Methods Compared for Sales Ops Teams",
    keyword: "salesforce google sheets integration",
    funnel: "BOFU",
    volume: 1900,
    difficulty: 24,
    cpc: 6.4,
    type: "How-To + Comparison",
    status: "review",
    scheduledFor: format(today, "yyyy-MM-dd"),
  },
  {
    id: "art_003",
    title: "How to Automate Google Sheets Data Updates Without Writing Code",
    keyword: "automate google sheets",
    funnel: "TOFU",
    volume: 3200,
    difficulty: 31,
    cpc: 3.1,
    type: "How-To Guide",
    status: "generating",
    scheduledFor: format(addDays(today, 1), "yyyy-MM-dd"),
  },
  {
    id: "art_002",
    title: "7 Supermetrics Alternatives for Google Sheets Data Teams",
    keyword: "supermetrics alternatives",
    funnel: "MOFU",
    volume: 1100,
    difficulty: 18,
    cpc: 4.2,
    type: "Alternatives List",
    status: "scheduled",
    scheduledFor: format(addDays(today, 3), "yyyy-MM-dd"),
  },
  {
    id: "art_004",
    title: "How to Connect HubSpot to Google Sheets: Every Method Compared",
    keyword: "connect hubspot to google sheets",
    funnel: "BOFU",
    volume: 880,
    difficulty: 22,
    cpc: 5.7,
    type: "How-To + Comparison",
    status: "scheduled",
    scheduledFor: format(addDays(today, 4), "yyyy-MM-dd"),
  },
  {
    id: "art_006",
    title: "Coupler.io vs Supermetrics: Which Data Connector Wins for Mid-Market Teams?",
    keyword: "coupler vs supermetrics",
    funnel: "BOFU",
    volume: 720,
    difficulty: 20,
    cpc: 5.1,
    type: "How-To + Comparison",
    status: "scheduled",
    scheduledFor: format(addDays(today, 7), "yyyy-MM-dd"),
  },
]

// ── Status helpers ──────────────────────────────────────────────────────────

/** Once an article is generated, keyword + article type are locked. */
export function isMetadataLocked(a: Article): boolean {
  return a.status !== "scheduled"
}

/** A scheduled article's auto-generation kicks off 24h before scheduledFor. */
export function lockDate(a: Article): Date {
  return addDays(parseISO(a.scheduledFor), -1)
}

export function hoursUntilLock(a: Article): number {
  return differenceInHours(lockDate(a), new Date())
}

export function lockMessage(a: Article): string {
  if (a.status === "scheduled") {
    const h = hoursUntilLock(a)
    if (h <= 0) return "Locking now — generation about to start"
    if (h < 24) return `Locks in ${h}h — keyword & type editable until then`
    const d = Math.floor(h / 24)
    return `Locks ${formatDistanceToNowStrict(lockDate(a), { addSuffix: true })} — ${d} day${d === 1 ? "" : "s"} to edit keyword & type`
  }
  if (a.status === "generating") return "Pipeline running — keyword & type are locked"
  if (a.status === "review") return "Generated — edit content directly. Keyword & type are locked."
  return "Published — read-only"
}

/** Whether the row can be dragged to another day. */
export function isDraggable(a: Article): boolean {
  return a.status === "scheduled"
}

/** Whether `target` is a valid drop target for article `a`.
 *  Scheduled articles can move freely — but the new date must leave at least 24h
 *  before generation kicks off, otherwise auto-pipeline fires immediately. */
export function canDropOn(a: Article, targetDate: Date): boolean {
  if (!isDraggable(a)) return false
  const lockAt = addDays(targetDate, -1)
  return !isBefore(lockAt, new Date())
}

// ── Date formatting ─────────────────────────────────────────────────────────

export function formatDayLabel(iso: string): string {
  return format(parseISO(iso), "EEEE, MMM d")
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "EEE, MMM d")
}

export function formatDayNumber(iso: string): string {
  return format(parseISO(iso), "dd")
}
