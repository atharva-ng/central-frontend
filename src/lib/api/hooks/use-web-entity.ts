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
 * Loads the user's web entity on the client, sharing the module-level cache
 * with `useOnboardingStepPolling` so the dashboard lands warm whenever the
 * user just finished polling through onboarding.
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

    if (!webEntityId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "missing-web-entity" })
      return
    }

    const cached = getCachedWebEntity(webEntityId)
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "ready", data: cached })
      return
    }

    async function run() {
      try {
        const { webEntity } = await onboardingRepository.getStep(getToken)
        if (cancelled) return
        if (!webEntity) {
          setState({ kind: "missing-web-entity" })
          return
        }
        setCachedWebEntity(webEntityId!, webEntity)
        setState({ kind: "ready", data: webEntity })
      } catch (err) {
        if (cancelled) return
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
