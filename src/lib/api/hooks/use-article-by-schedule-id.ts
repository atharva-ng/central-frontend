"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { ApiError } from "../core"
import {
  scheduledArticlesRepository,
  type ArticleDetailDTO,
} from "../repositories/scheduled-articles.client"

export type ArticleByScheduleIdLoadState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ArticleDetailDTO }

/**
 * Loads the article (calendar slot + any generated content) for the given
 * scheduled article id. Returns `not-found` for a 404 so the review screen
 * can distinguish a missing slot from a network failure.
 */
export function useArticleByScheduleId(
  scheduledArticleId: string | null | undefined,
): ArticleByScheduleIdLoadState {
  const { getToken } = useAuth()
  const [state, setState] = useState<ArticleByScheduleIdLoadState>({ kind: "loading" })

  useEffect(() => {
    if (!scheduledArticleId) return
    let cancelled = false
    setState({ kind: "loading" })

    async function run() {
      try {
        const data = await scheduledArticlesRepository.getByScheduleId(
          getToken,
          scheduledArticleId!,
        )
        if (cancelled) return
        setState({ kind: "ready", data })
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: "not-found" })
          return
        }
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? `Couldn't load the article (${err.status}).`
              : "Couldn't reach the server.",
        })
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [getToken, scheduledArticleId])

  return state
}
