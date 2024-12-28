import { Anchor, Button, Text } from '@mantine/core'
import Link from 'next/link'
import React from 'react'
import { newArrivals } from '@/app/constants'

export function NewArrivals() {
  return (
    <Anchor fw={600} fz="h4" href={newArrivals} component={Link}>
      <Button size="sm" lts="0.05rem" tt="uppercase" color="primary">
        <Text visibleFrom="xs">New Arrivals</Text>
        <Text hiddenFrom="xs">New</Text>
      </Button>
    </Anchor>
  )
}
