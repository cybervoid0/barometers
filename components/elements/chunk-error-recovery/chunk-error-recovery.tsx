'use client'

import { useEffect } from 'react'
import { isChunkError, reloadIfAllowed } from '@/utils'

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
