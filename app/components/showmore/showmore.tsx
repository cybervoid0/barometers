import { Spoiler } from '@mantine/core'
import { PropsWithChildren } from 'react'

export function ShowMore({
  children,
  height = 0,
}: PropsWithChildren & { height?: number }) {
  return (
    <Spoiler
      maxHeight={height}
      showLabel="Show more"
      hideLabel="Show less"
      classNames={{
        control: 'text-neutral-600 !font-semibold z-10',
      }}
    >
      {children}
    </Spoiler>
  )
}
