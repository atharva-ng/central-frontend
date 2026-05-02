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
  "How-To Guide",
  "How-To + Comparison",
  "Listicle / Roundup",
  "Alternatives List",
  "What-Is / Definition",
]

// Dummy data anchored to "today". The dev preview reads `new Date()` at render
// so the relative status badges stay coherent across week navigation.
const today = startOfDay(new Date())

export const SEED_ARTICLES: Article[] = [
  {
    id: "art_005",
    title: "15 LeetCode Patterns Every SDE II Should Recognize on Sight",
    keyword: "leetcode patterns",
    funnel: "MOFU",
    volume: 5400,
    difficulty: 28,
    cpc: 0.66,
    type: "Listicle / Roundup",
    status: "published",
    scheduledFor: format(addDays(today, -3), "yyyy-MM-dd"),
  },
  {
    id: "art_001",
    title: "Master the STAR Method: A Framework That Actually Lands the Offer",
    keyword: "interview star method",
    funnel: "TOFU",
    volume: 60500,
    difficulty: 36,
    cpc: 0.87,
    type: "How-To Guide",
    status: "review",
    scheduledFor: format(today, "yyyy-MM-dd"),
  },
  {
    id: "art_003",
    title: "Scalability Explained: Building Systems That Grow With Demand",
    keyword: "scalability",
    funnel: "MOFU",
    volume: 18100,
    difficulty: 24,
    cpc: 4.48,
    type: "What-Is / Definition",
    status: "generating",
    scheduledFor: format(addDays(today, 1), "yyyy-MM-dd"),
  },
  {
    id: "art_002",
    title: "AlgoExpert Alternatives: 7 Platforms for Real SDE Interview Prep",
    keyword: "algoexpert alternatives",
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
    title: "Git Rebase vs Merge: When to Use Each (And Why It Matters in Reviews)",
    keyword: "git rebase",
    funnel: "TOFU",
    volume: 14800,
    difficulty: 37,
    cpc: 1.59,
    type: "How-To + Comparison",
    status: "scheduled",
    scheduledFor: format(addDays(today, 4), "yyyy-MM-dd"),
  },
  {
    id: "art_006",
    title: "LRU Cache from Scratch: Design, Code, and Common Interview Twists",
    keyword: "lru cache",
    funnel: "MOFU",
    volume: 6600,
    difficulty: 24,
    cpc: 1.81,
    type: "How-To Guide",
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
