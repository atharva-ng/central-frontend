// Article record — represents what comes back from the article store.
// Used by the Tiptap editor screen at /articles/[id].

import type { ArticleStatus } from "@/components/app/StatusBadge"
import type { Funnel } from "@/components/app/FunnelBadge"

export interface ArticleImage {
  position: "thumbnail" | "mid-article"
  alt: string
  s3_key: string // empty string == not yet generated
}

export interface ArticleRecord {
  id: string
  title: string
  keyword: string
  type: string
  funnel: Funnel
  cluster_id: string
  word_count: number
  intent: string
  /** 0–100 opportunity score for the keyword this article targets. */
  opportunity_score: number
  /** SEO stats — surfaced alongside the score on the article sidebar. */
  volume: number
  difficulty: number
  cpc: number
  status: ArticleStatus
  generated_at?: string
  /** ISO date when the article will auto-publish if approved. */
  auto_publish_at?: string
  published_at?: string
  live_url?: string
  destination: "framer" | "manual"
  meta_title: string
  meta_description: string
  url_slug: string
  images: ArticleImage[]
  article_content: string // markdown with {{IMAGE_THUMBNAIL}} / {{IMAGE_MID_ARTICLE}} placeholders
  schema: { article: object; faq: object; generated: boolean }
}

const ARTICLE_MD = `# Master the STAR Method: A Framework That Actually Lands the Offer

{{IMAGE_THUMBNAIL}}

You can solve LeetCode mediums in your sleep. You can whiteboard a distributed cache without breaking a sweat. Then "tell me about a time you handled a conflict" comes up — and the offer slips because your story rambled for four minutes and never landed the point.

This is the STAR method, refined for software engineers — not the generic version on every career site. We'll cover what to skip, what hiring committees actually score on, and how to tell stories that prove engineering judgment in under two minutes.

## Why "Tell Me About a Time…" Trips Up Senior Engineers

Engineers default to chronology. We start with context, walk through every system involved, narrate every edge case we considered, and forget the interviewer is grading two things: *did you make a decision*, and *did the outcome justify that decision*?

Behavioral rounds aren't about your memory of events. They're about whether your judgment scales to the role you're applying for. STAR gives you a frame that makes that judgment legible in 90 seconds — which is roughly all the airtime a single answer gets in a structured loop.

## The STAR Method, Decoded

STAR stands for **Situation, Task, Action, Result** — a four-beat structure for narrative answers. It isn't a script; it's a forcing function. If your answer doesn't move through all four beats, the interviewer can't score it cleanly.

For senior engineering roles, weight the beats roughly: 10% Situation, 15% Task, 60% Action, 15% Result. Most candidates flip this — burning ninety seconds on context and giving the action thirty rushed seconds. That's the bug.

## Step 1 — Pick the Situation That Earns the Question

Not every project deserves a STAR answer. The situation has to be *legible* to a stranger in two sentences and *consequential* enough that the action matters. Production incidents, contentious technical decisions, and cross-team migrations work. Solo refactors usually don't.

Test your situation: if you can't say what was at stake in fifteen seconds, pick another story.

## Step 2 — Frame the Task Like a Postmortem

The Task isn't your job description — it's the specific decision you owned. "I led the migration" is too vague. "I owned the cutover plan and the rollback criteria, with my staff engineer on call as the tiebreaker" is a task. The narrower the task, the sharper the action sounds.

{{IMAGE_MID_ARTICLE}}

## Step 3 — Make the Action a Demo of Judgment

The Action is where senior candidates win or lose. Skip the chronology. Lead with the trade-off you saw, the option you ruled out, and *why*. Then the option you took, the risk you accepted, and how you de-risked it.

This is the part that distinguishes SDE I answers from SDE II answers from staff answers. The seniority shows in what you considered and rejected — not what you ultimately built.

## Frequently Asked Questions

### How long should a STAR answer be?

Aim for 90–120 seconds when you tell it out loud. If you're going past two minutes, you're either over-narrating the situation or you picked the wrong story. Cut.

### Should I prepare specific stories or improvise?

Prepare 6–8 stories that each illustrate two or three different competencies (conflict, ambiguity, ownership, technical judgment). Practice the *opening twenty seconds* of each — that's what gets you to the action without rambling.

### What if the interviewer keeps interrupting?

Good. They're steering you toward the part they want to score. Follow the question, drop the rest of your prepared structure, and keep the action sharp. STAR is scaffolding, not a contract.
`

export const ARTICLE: ArticleRecord = {
  id: "art_001",
  title: "Master the STAR Method: A Framework That Actually Lands the Offer",
  keyword: "interview star method",
  type: "How-To Guide",
  funnel: "TOFU",
  cluster_id: "interview-methods",
  word_count: 2480,
  intent: "informational",
  opportunity_score: 87,
  volume: 60500,
  difficulty: 36,
  cpc: 0.87,
  status: "review",
  generated_at: "2026-04-30",
  auto_publish_at: "2026-05-02",
  destination: "framer",
  meta_title: "Master the STAR Method: A Framework That Lands the Offer",
  meta_description:
    "The STAR method, refined for senior engineers. Learn what to skip, what hiring committees score on, and how to tell stories that prove judgment.",
  url_slug: "star-method-interview",
  images: [
    {
      position: "thumbnail",
      alt: "Engineer mid-interview, gesturing at a whiteboard",
      s3_key: "https://picsum.photos/seed/hack2hire-thumb/1200/630",
    },
    {
      position: "mid-article",
      alt: "Diagram of the four STAR beats with time-weights for each",
      s3_key: "https://picsum.photos/seed/hack2hire-mid/1200/450",
    },
  ],
  schema: {
    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline:
        "Master the STAR Method: A Framework That Actually Lands the Offer",
      datePublished: "2026-05-02",
      author: { "@type": "Organization", name: "Hack2hire" },
    },
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How long should a STAR answer be?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Aim for 90–120 seconds when told out loud. If you're going past two minutes, you're either over-narrating the situation or you picked the wrong story.",
          },
        },
        {
          "@type": "Question",
          name: "Should I prepare specific stories or improvise?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Prepare 6–8 stories that each illustrate two or three different competencies. Practice the opening twenty seconds of each.",
          },
        },
      ],
    },
    generated: true,
  },
  article_content: ARTICLE_MD,
}

export const SECTION_HEADINGS = [
  "Why \"Tell Me About a Time…\" Trips Up Senior Engineers",
  "The STAR Method, Decoded",
  "Step 1 — Pick the Situation That Earns the Question",
  "Step 2 — Frame the Task Like a Postmortem",
  "Step 3 — Make the Action a Demo of Judgment",
  "Frequently Asked Questions",
]

export function clusterLabel(id: string): string {
  return id
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ")
}
