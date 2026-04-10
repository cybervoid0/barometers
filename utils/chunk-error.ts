const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'module factory is not available',
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
] as const

const RELOAD_STORAGE_KEY = 'chunk-error-reload'
const RELOAD_COOLDOWN_MS = 10_000

export function isChunkError(errorOrMessage: Error | string): boolean {
  const name = errorOrMessage instanceof Error ? errorOrMessage.name || '' : ''
  const message = errorOrMessage instanceof Error ? errorOrMessage.message || '' : errorOrMessage

  return CHUNK_ERROR_PATTERNS.some(p => name.includes(p) || message.includes(p))
}

export function reloadIfAllowed(): boolean {
  try {
    const lastReload = sessionStorage.getItem(RELOAD_STORAGE_KEY)
    const now = Date.now()

    if (!lastReload || now - Number(lastReload) > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now))
      window.location.reload()
      return true
    }
  } catch {
    // sessionStorage may be unavailable (private browsing, etc.)
  }
  return false
}
