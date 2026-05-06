"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect, useRef } from "react"
import { authRepository } from "@/lib/api/client"

export function AuthTokenSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const lastSynced = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      if (lastSynced.current !== null) {
        lastSynced.current = null
        void authRepository.clearToken()
      }
      return
    }

    let cancelled = false
    void (async () => {
      const token = await getToken()
      if (cancelled || !token || token === lastSynced.current) return
      try {
        await authRepository.syncToken(token)
        lastSynced.current = token
      } catch {
        lastSynced.current = null
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, getToken])

  return null
}
