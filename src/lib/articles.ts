import { addDays, differenceInHours, format, formatDistanceToNowStrict, parseISO, startOfDay } from "date-fns"
import { ARTICLE_LOCK_DAYS_OFFSET, type ArticleStatus, type Funnel } from "@/constants"

export { ARTICLE_TYPES } from "@/constants/articles"

export interface Article {
  id: string
  title: string
  keyword: string
  funnel: Funnel
  volume: number
  difficulty: number
  cpc: number
  type: string
  status: ArticleStatus
  scheduledFor: string // ISO yyyy-mm-dd
  additionalInstructions?: string
}

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
    status: "readyForReview",
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

/** An article is in an errored generation state — the backend derives this
 *  when the linked WebEntityMasterContext is in CGEStatusError. Surfaces a
 *  retry affordance on the dashboard and /articles. */
export function isErrored(a: Article): boolean {
  return a.status === "error"
}

/**
 * "Non-published article" per the backend contract:
 *   - status !== "published"
 *   - scheduledFor strictly > today (UTC)
 * Reschedule (drag-drop + sidebar date picker) and most edits hinge on this.
 */
export function isNonPublished(a: Article): boolean {
  if (a.status === "published") return false
  // Compare on a UTC date boundary to match the backend's "today" definition.
  // The article's scheduledFor is a YYYY-MM-DD string representing UTC midnight.
  const now = new Date()
  const todayUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const [y, m, d] = a.scheduledFor.split("-").map(Number)
  const articleUtcMidnight = Date.UTC(y, m - 1, d)
  return articleUtcMidnight > todayUtcMidnight
}

/** A scheduled article's auto-generation kicks off 24h before scheduledFor. */
export function lockDate(a: Article): Date {
  return addDays(parseISO(a.scheduledFor), ARTICLE_LOCK_DAYS_OFFSET)
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
  if (a.status === "error") return "Generation failed — retry to run the pipeline again"
  if (a.status === "readyForReview") return "Generated — edit content directly. Keyword & type are locked."
  if (a.status === "draft") {
    return isNonPublished(a)
      ? "Draft — title editable. Reschedule until the publish date arrives."
      : "Draft — read-only"
  }
  return "Published — read-only"
}

/**
 * Whether the row can be dragged to another day. Matches the backend
 * "non-published, non-generating" rule: scheduled / draft / readyForReview
 * are draggable while their scheduledFor stays in the future.
 */
export function isDraggable(a: Article): boolean {
  if (a.status === "generating" || a.status === "published" || a.status === "error") return false
  return isNonPublished(a)
}

/** Whether `target` is a valid drop target for article `a`.
 *  Reschedule must land strictly > today (UTC) per the backend non-published rule. */
export function canDropOn(a: Article, targetDate: Date): boolean {
  if (!isDraggable(a)) return false
  // Reuse the same UTC-date comparison as isNonPublished so frontend and
  // backend agree on what "in the future" means.
  const todayUtcMidnight = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  )
  const targetUtcMidnight = Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  )
  return targetUtcMidnight > todayUtcMidnight
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
