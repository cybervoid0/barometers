'use client'

import { Center, Stack, Text, Title } from '@mantine/core'

export default function Error({ error }: { error: Error }) {
  return (
    <Center h="100%">
      <Stack gap={0}>
        <Title c="red">Error</Title>
        <Text c="red" maw="20rem" size="xs">
          {error.message}
        </Text>
      </Stack>
    </Center>
  )
}
