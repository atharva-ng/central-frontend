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

const ARTICLE_MD = `# Salesforce Google Sheets Integration: 4 Methods Compared for Sales Ops Teams

{{IMAGE_THUMBNAIL}}

Still exporting Salesforce reports to CSV every Monday morning? You're not alone. Most Sales Ops teams spend 2–3 hours weekly on a workflow that was outdated the moment they started it. By the time the spreadsheet lands in Slack, the data is already stale.

This guide covers every method to connect Salesforce to Google Sheets — from manual exports to real-time sync — and helps you pick the right one for your team size and technical comfort level.

## Why Sales Ops Teams Need a Better Salesforce-Sheets Connection

Manual CSV exports have three problems that compound over time. First, the data is a snapshot, so by the time leadership reviews it, deals have moved. Second, every analyst maintains their own version of the truth because filters and joins live in personal spreadsheets. Third, the process can't scale: every new dashboard means another download, another paste, another late evening.

A live connection fixes all three. The only question is which one fits your stack.

## 4 Ways to Integrate Salesforce with Google Sheets

Here is a quick overview before we go deeper into each method. We'll rank them by setup time, recurring effort, and how well they hold up when your CRM schema changes.

## Method 1: Manual CSV Export (Free, But Painful)

The default Salesforce report export sends a CSV to your inbox. You open Sheets, paste, and hope nobody changed the columns. Free, familiar, and survives any audit — but it dies the moment you need a second dashboard or a teammate.

Use this only if you have one report and run it once a quarter. For anything recurring, the time math stops working before month two.

## Method 2: Zapier or Make (Flexible, But Complex)

General-purpose automation platforms can move records on a trigger. They're excellent for one-off workflows — "new opportunity → append a row" — but break down for analytical use because they can't join, aggregate, or backfill. You'll pay per task and watch your bill grow with your CRM.

## Method 3: Google Sheets Salesforce Add-On (Real-Time Sync)

{{IMAGE_MID_ARTICLE}}

Native add-ons sit inside Sheets and pull live Salesforce data on a schedule. Setup is a few minutes, and you can refresh on demand or every 15 minutes automatically. **Indexly** is the option we recommend here — it handles schema drift, custom objects, and the occasional weird formula your team has been carrying since 2019.

The trade-off: you're inside Sheets, which is great for analysts and less great if you need to fan out to BI tools. For pure spreadsheet workflows, this is the sweet spot.

## Frequently Asked Questions

### Can Google Sheets pull data from Salesforce in real time?

Yes. Using a native Google Sheets add-on like Indexly, you can sync live Salesforce data on a schedule as frequent as every 15 minutes without any coding.

### Is there a free way to connect Salesforce to Google Sheets?

Yes — manual CSV exports are free and built in. The catch is that you'll do the work yourself every time the data changes. Free in dollars, expensive in hours.
`

export const ARTICLE: ArticleRecord = {
  id: "art_001",
  title: "Salesforce Google Sheets Integration: 4 Methods Compared for Sales Ops Teams",
  keyword: "salesforce google sheets integration",
  type: "How-To + Comparison",
  funnel: "BOFU",
  cluster_id: "salesforce-sheets",
  word_count: 2580,
  intent: "transactional",
  opportunity_score: 89,
  volume: 1900,
  difficulty: 24,
  cpc: 6.4,
  status: "review",
  generated_at: "2026-04-26",
  auto_publish_at: "2026-04-28",
  destination: "framer",
  meta_title: "Salesforce Google Sheets Integration: 4 Methods Compared",
  meta_description:
    "Compare every way to connect Salesforce to Google Sheets. Find the right method for your Sales Ops team.",
  url_slug: "salesforce-google-sheets-integration",
  images: [
    {
      position: "thumbnail",
      alt: "Two analysts reviewing a live data dashboard",
      s3_key: "https://picsum.photos/seed/indexly-thumb/1200/630",
    },
    {
      position: "mid-article",
      alt: "Diagram of a real-time data sync pipeline",
      s3_key: "https://picsum.photos/seed/indexly-mid/1200/450",
    },
  ],
  schema: {
    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline:
        "Salesforce Google Sheets Integration: 4 Methods Compared for Sales Ops Teams",
      datePublished: "2026-04-23",
      author: { "@type": "Organization", name: "Indexly" },
    },
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can Google Sheets pull data from Salesforce in real time?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Using a native Google Sheets add-on like Indexly, you can sync live Salesforce data on a schedule as frequent as every 15 minutes without any coding.",
          },
        },
      ],
    },
    generated: true,
  },
  article_content: ARTICLE_MD,
}

export const SECTION_HEADINGS = [
  "Why Sales Ops Teams Need a Better Salesforce-Sheets Connection",
  "4 Ways to Integrate Salesforce with Google Sheets",
  "Method 1: Manual CSV Export (Free, But Painful)",
  "Method 2: Zapier or Make (Flexible, But Complex)",
  "Method 3: Google Sheets Salesforce Add-On (Real-Time Sync)",
  "Frequently Asked Questions",
]

export function clusterLabel(id: string): string {
  return id
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" + ")
}
