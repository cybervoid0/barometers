import { Anchor, Button, Text } from '@mantine/core'
import Link from 'next/link'
import React from 'react'
import { FrontRoutes } from '@/utils/routes-front'

export function NewArrivals() {
  return (
    <Anchor fw={600} fz="h4" href={FrontRoutes.NewArrivals} component={Link}>
      <Button
        className="uppercase tracking-wider transition-all !duration-300 ease-out hover:contrast-125"
        size="sm"
        color="primary"
      >
        <Text visibleFrom="xs">New Arrivals</Text>
        <Text hiddenFrom="xs">New</Text>
      </Button>
    </Anchor>
  )
}
