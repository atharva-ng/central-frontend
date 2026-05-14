"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { addDays, format } from "date-fns"
import { STORAGE_KEYS } from "@/constants/storage-keys"
import { ApiError } from "../core"
import {
  scheduledArticlesRepository,
  type ScheduledArticlesResponse,
} from "../repositories/scheduled-articles.client"

export type ScheduledArticlesLoadState =
  | { kind: "loading" }
  | { kind: "missing-web-entity" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ScheduledArticlesResponse }

/**
 * Loads the scheduled articles for the Mon–Sun week starting at `weekStart`.
 * The web entity id is read from localStorage (set during onboarding) — same
 * source the keywords screen uses. Re-fetches whenever the week changes.
 */
export function useScheduledArticles(weekStart: Date): ScheduledArticlesLoadState {
  const { getToken } = useAuth()
  const [state, setState] = useState<ScheduledArticlesLoadState>({ kind: "loading" })

  const from = format(weekStart, "yyyy-MM-dd")
  const to = format(addDays(weekStart, 6), "yyyy-MM-dd")

  useEffect(() => {
    let cancelled = false

    let webEntityId: string | null = null
    try {
      webEntityId = window.localStorage.getItem(STORAGE_KEYS.webEntityId)
    } catch {
      // localStorage unavailable.
    }

    if (!webEntityId) {
      // Syncing state from localStorage (an external store) on mount —
      // the legitimate exception listed in React's set-state-in-effect guidance.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "missing-web-entity" })
      return
    }

    // Reset to loading while the new week's data is in flight.
    setState({ kind: "loading" })

    async function run() {
      try {
        const data = await scheduledArticlesRepository.list(getToken, {
          webEntityId: webEntityId!,
          from,
          to,
        })
        if (cancelled) return
        setState({ kind: "ready", data })
      } catch (err) {
        if (cancelled) return
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? `Couldn't load the schedule (${err.status}).`
              : "Couldn't reach the server.",
        })
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [getToken, from, to])

  return state
}
