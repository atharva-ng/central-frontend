"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { STORAGE_KEYS } from "@/constants/storage-keys"
import { ApiError } from "../core"
import { onboardingRepository } from "../repositories/onboarding.client"
import type { WebEntity } from "../onboarding-steps"
import { getCachedWebEntity, setCachedWebEntity } from "../web-entity-cache"

export type WebEntityLoadState =
  | { kind: "loading" }
  | { kind: "missing-web-entity" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: WebEntity }

/**
 * Loads the user's web entity on the client. Reads through the module-level
 * cache so screens like /settings share state with `useOnboardingStepPolling`
 * (which warms the cache during onboarding) — once fetched, subsequent
 * navigations are instant until something explicitly invalidates the entry.
 *
 * When a cached `webEntityId` exists in localStorage we use it as the cache
 * key for a fast hit; otherwise we fetch via `getCurrentWebEntity`, persist
 * the returned id back into localStorage, and cache the entity.
 */
export function useWebEntity(): WebEntityLoadState {
  const { getToken } = useAuth()
  const [state, setState] = useState<WebEntityLoadState>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false

    let webEntityId: string | null = null
    try {
      webEntityId = window.localStorage.getItem(STORAGE_KEYS.webEntityId)
    } catch {
      // localStorage unavailable.
    }

    if (webEntityId) {
      const cached = getCachedWebEntity(webEntityId)
      if (cached) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ kind: "ready", data: cached })
        return
      }
    }

    async function run() {
      try {
        const webEntity = await onboardingRepository.getCurrentWebEntity(getToken)
        if (cancelled) return
        setCachedWebEntity(webEntity.id, webEntity)
        try {
          window.localStorage.setItem(STORAGE_KEYS.webEntityId, webEntity.id)
        } catch {
          // localStorage unavailable — cache hit will still work for the session.
        }
        setState({ kind: "ready", data: webEntity })
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: "missing-web-entity" })
          return
        }
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? `Couldn't load the web entity (${err.status}).`
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
