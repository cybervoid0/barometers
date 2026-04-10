'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

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

function isChunkError(error: Error): boolean {
  const message = error.message || ''
  const name = error.name || ''
  return CHUNK_ERROR_PATTERNS.some(p => name.includes(p) || message.includes(p))
}

function tryAutoReload(): boolean {
  try {
    const lastReload = sessionStorage.getItem(RELOAD_KEY)
    const now = Date.now()

    if (!lastReload || now - Number(lastReload) > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_KEY, String(now))
      window.location.reload()
      return true
    }
  } catch {
    // sessionStorage may be unavailable
  }
  return false
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (isChunkError(error)) {
      tryAutoReload()
    }
  }, [error])

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <h2 className="font-cinzel text-secondary text-6xl">Error</h2>
        <h2 className="font-cinzel text-muted-foreground text-4xl tracking-wide">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 pt-4">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
