'use client'

// Error boundaries must be Client Components

import { useEffect } from 'react'
import { Button, Center, Title, Text } from '@mantine/core'

export default function Error({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Center>
      <Title fz="h2">Something went wrong!</Title>
      {error?.message && <Text>{error.message}</Text>}
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </Center>
  )
}
