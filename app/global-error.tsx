'use client'

import { useEffect } from 'react'

const RELOAD_KEY = 'chunk-error-reload'
const RELOAD_COOLDOWN_MS = 10_000

function isChunkError(error: Error): boolean {
  const message = error.message || ''
  const name = error.name || ''

  return (
    name === 'ChunkLoadError' ||
    message.includes('Loading chunk') ||
    message.includes('module factory is not available') ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  )
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
    // sessionStorage may be unavailable (private browsing, etc.)
  }
  return false
}

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '2rem', color: '#666', maxWidth: '28rem' }}>
            The application encountered an unexpected error. Please try reloading the page.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#18181b',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: 'transparent',
                color: '#18181b',
                border: '1px solid #d4d4d8',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
