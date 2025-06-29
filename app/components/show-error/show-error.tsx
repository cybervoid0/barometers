'use client'

import { useEffect } from 'react'
import { Button, Center } from '@mantine/core'
import { showError } from '@/utils/notification'

interface ServerErrorProps {
  message: string
}

export function ShowError({ message }: ServerErrorProps) {
  useEffect(() => {
    if (message) showError(message)
  }, [message])
  return (
    <Center>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        color="dark"
      >
        Reload
      </Button>
    </Center>
  )
}
