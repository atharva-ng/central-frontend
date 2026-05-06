"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { STORAGE_KEYS } from "@/constants/storage-keys"
import { ApiError } from "../core"
import { siteIntelligenceRepository, type KeywordDataResponse } from "../repositories/site-intelligence.client"

export type KeywordDataLoadState =
  | { kind: "loading" }
  | { kind: "missing-web-entity" }
  | { kind: "not-ready" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: KeywordDataResponse }

export function useKeywordData(): KeywordDataLoadState {
  const { getToken } = useAuth()
  const [state, setState] = useState<KeywordDataLoadState>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false

    let webEntityId: string | null = null
    try {
      webEntityId = window.localStorage.getItem(STORAGE_KEYS.webEntityId)
    } catch {
      // localStorage unavailable
    }

    if (!webEntityId) {
      // Syncing state from localStorage (an external store) on mount —
      // the legitimate exception listed in React's set-state-in-effect guidance.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "missing-web-entity" })
      return
    }

    async function run() {
      try {
        const data = await siteIntelligenceRepository.getKeywordData(getToken, webEntityId!)
        if (cancelled) return
        setState({ kind: "ready", data })
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 409) {
          setState({ kind: "not-ready" })
          return
        }
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: "missing-web-entity" })
          return
        }
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? `Couldn't load keywords (${err.status}).`
              : "Couldn't reach the server.",
        })
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [getToken])

  return state
}
