import { Center, Title, Text, Stack } from '@mantine/core'
import React from 'react'

export default function NotFound() {
  return (
    <Center h="100%">
      <Stack gap={0} align="center">
        <Title>Not Found</Title>
        <Text size="xs">Requested page is not available</Text>
      </Stack>
    </Center>
  )
}
