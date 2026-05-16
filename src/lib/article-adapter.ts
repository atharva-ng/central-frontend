// Maps the backend ArticleDetailDTO onto the ArticleRecord shape the review
// screens already render. Centralised here so both /articles/[id] and
// /articles/view/[id] consume an identical view model.

import { format, parseISO } from "date-fns"
import type { ArticleDetailDTO } from "@/lib/api/client"
import type { ArticleDestination, ArticleImagePosition, Funnel } from "@/constants"
import type { ArticleImage, ArticleRecord } from "@/lib/article-data"

function toFunnel(s: string | undefined): Funnel {
  return s === "MOFU" || s === "BOFU" ? s : "TOFU"
}

function toDestination(s: string | undefined): ArticleDestination {
  return s === "manual" ? "manual" : "framer"
}

function toImagePosition(p: string): ArticleImagePosition {
  return p === "mid-article" ? "mid-article" : "thumbnail"
}

export function articleDtoToRecord(dto: ArticleDetailDTO): ArticleRecord {
  const sa = dto.scheduledArticle
  const title = sa.title || sa.keyword

  // FinalArticleContent already has images stitched in as raw <img> tags, so
  // we hand the editor an empty image list — the token-replacement loop is a
  // no-op and `marked` passes the HTML through untouched.
  const articleContent = dto.content ?? ""

  const images: ArticleImage[] = (dto.images ?? []).map((img) => ({
    position: toImagePosition(img.position),
    alt: img.alt ?? "",
    s3_key: img.s3Key ?? "",
  }))

  return {
    id: sa.id,
    title,
    keyword: sa.keyword,
    type: sa.articleType ?? "—",
    funnel: toFunnel(dto.funnel),
    cluster_id: dto.cluster ?? "",
    word_count: dto.wordCount,
    intent: dto.intent ?? "informational",
    opportunity_score: dto.opportunityScore,
    volume: dto.volume,
    difficulty: dto.difficulty,
    cpc: dto.cpc,
    status: sa.status,
    generated_at: dto.generatedAt
      ? format(parseISO(dto.generatedAt), "yyyy-MM-dd")
      : undefined,
    // scheduleDate doubles as auto-publish per product decision.
    auto_publish_at: sa.scheduleDate,
    // Placeholder fields the backend stubs out until publishing is wired
    // (dto.publishedAt / dto.liveUrl come back as a sentinel string).
    published_at: dto.publishedAt,
    live_url: dto.liveUrl,
    destination: toDestination(dto.destination),
    meta_title: dto.meta?.metaTitle ?? "",
    meta_description: dto.meta?.metaDescription ?? "",
    url_slug: dto.urlSlug,
    images,
    article_content: articleContent,
    schema: {
      article: (dto.schema?.articleSchema as object) ?? {},
      faq: (dto.schema?.faqSchema as object) ?? {},
      generated: dto.schemaGenerated,
    },
  }
}
