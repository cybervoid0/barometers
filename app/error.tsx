'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { isChunkError, reloadIfAllowed } from '@/utils'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (isChunkError(error)) {
      reloadIfAllowed()
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
