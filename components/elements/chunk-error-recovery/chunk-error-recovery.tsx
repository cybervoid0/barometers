'use client'

import { useEffect } from 'react'

const RELOAD_KEY = 'chunk-error-reload'
const RELOAD_COOLDOWN_MS = 10_000

const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'module factory is not available',
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
] as const

function isChunkError(message: string): boolean {
  return CHUNK_ERROR_PATTERNS.some(pattern => message.includes(pattern))
}

function reloadIfAllowed(): void {
  try {
    const lastReload = sessionStorage.getItem(RELOAD_KEY)
    const now = Date.now()

    if (!lastReload || now - Number(lastReload) > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_KEY, String(now))
      window.location.reload()
    }
  } catch {
    // sessionStorage may be unavailable
  }
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkError(event.message || '')) {
        event.preventDefault()
        reloadIfAllowed()
      }
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error ? event.reason.message : String(event.reason ?? '')

      if (isChunkError(message)) {
        event.preventDefault()
        reloadIfAllowed()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
