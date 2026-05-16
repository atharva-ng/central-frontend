"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { addDays, format, parseISO } from "date-fns"
import { STORAGE_KEYS } from "@/constants/storage-keys"
import { ApiError } from "../core"
import {
  scheduledArticlesRepository,
  type ScheduledArticleDTO,
  type ScheduledArticlesResponse,
} from "../repositories/scheduled-articles.client"
import {
  bucketArticlesByWeek,
  getCachedWeek,
  setCachedWeek,
} from "../scheduled-articles-cache"

export type ScheduledArticlesByWeeksLoadState =
  | { kind: "loading" }
  | { kind: "missing-web-entity" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ScheduledArticlesResponse }

/**
 * Loads scheduled articles for the supplied Mon-aligned weeks, sharing a
 * module-level cache with every other caller. Weeks already in the cache are
 * served instantly; any missing weeks trigger a single combined request
 * covering the contiguous span from earliest-missing to latest-missing.
 */
export function useScheduledArticlesByWeeks(
  weekStarts: Date[],
): ScheduledArticlesByWeeksLoadState {
  const { getToken } = useAuth()
  const [state, setState] = useState<ScheduledArticlesByWeeksLoadState>({ kind: "loading" })

  // Stable key for the requested week-set — drives both the effect dep and
  // the in-effect cache lookup so the two never get out of sync.
  const weeksJoined = weekStarts
    .map((d) => format(d, "yyyy-MM-dd"))
    .sort()
    .join("|")

  useEffect(() => {
    let cancelled = false

    let webEntityId: string | null = null
    try {
      webEntityId = window.localStorage.getItem(STORAGE_KEYS.webEntityId)
    } catch {
      // localStorage unavailable.
    }

    if (!webEntityId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "missing-web-entity" })
      return
    }

    const requested = weeksJoined.split("|").filter(Boolean)
    if (requested.length === 0) {
      setState({
        kind: "ready",
        data: { from: "", to: "", articles: [] },
      })
      return
    }

    const missing = requested.filter(
      (k) => getCachedWeek(webEntityId!, k) === undefined,
    )

    function buildReady(): ScheduledArticlesByWeeksLoadState {
      const articles: ScheduledArticleDTO[] = []
      for (const k of requested) {
        articles.push(...(getCachedWeek(webEntityId!, k) ?? []))
      }
      return {
        kind: "ready",
        data: {
          from: requested[0],
          to: format(
            addDays(parseISO(requested[requested.length - 1]), 6),
            "yyyy-MM-dd",
          ),
          articles,
        },
      }
    }

    // Cache hit for every requested week — serve immediately.
    if (missing.length === 0) {
      setState(buildReady())
      return
    }

    setState({ kind: "loading" })

    // One combined request covering the contiguous span from earliest to
    // latest missing week. May re-fetch a cached week sitting between two
    // gaps — that's the simpler trade-off vs. firing one request per gap.
    const from = missing[0]
    const lastMissingStart = parseISO(missing[missing.length - 1])
    const to = format(addDays(lastMissingStart, 6), "yyyy-MM-dd")

    // Enumerate every week-start in the fetched span so empty weeks get
    // cached as confirmed-empty instead of re-fetched next time.
    const fetchedWeekStarts: string[] = []
    let cursor = parseISO(from)
    while (cursor.getTime() <= lastMissingStart.getTime()) {
      fetchedWeekStarts.push(format(cursor, "yyyy-MM-dd"))
      cursor = addDays(cursor, 7)
    }

    async function run() {
      try {
        const data = await scheduledArticlesRepository.list(getToken, {
          webEntityId: webEntityId!,
          from,
          to,
        })
        if (cancelled) return

        const buckets = bucketArticlesByWeek(data.articles, fetchedWeekStarts)
        for (const k of fetchedWeekStarts) {
          setCachedWeek(webEntityId!, k, buckets.get(k) ?? [])
        }

        setState(buildReady())
      } catch (err) {
        if (cancelled) return
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? `Couldn't load articles (${err.status}).`
              : "Couldn't reach the server.",
        })
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [getToken, weeksJoined])

  return state
}
