import React from 'react'
import Link from 'next/link'
import { Button, ButtonProps, Text, Tooltip } from '@mantine/core'

import { BarometerDTO } from '@/app/types'

interface Props extends ButtonProps {
  barometer: BarometerDTO
}

export default function InaccuracyReport({ barometer, ...props }: Props) {
  return (
    <Tooltip
      multiline
      w={210}
      label={
        <Text size="xs">
          Report issues in the description of &laquo;
          <span style={{ textTransform: 'capitalize' }}>{barometer.name}</span>&raquo;
        </Text>
      }
    >
      <Link href={`/collection/items/${barometer.slug}/report`}>
        <Button variant="light" color="primary" {...props}>
          <Text fw={400} fz="sm" size="md" lts="0.05rem" tt="uppercase">
            Report inaccuracy
          </Text>
        </Button>
      </Link>
    </Tooltip>
  )
}
