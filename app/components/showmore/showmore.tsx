import { Spoiler } from '@mantine/core'
import { PropsWithChildren } from 'react'

export function ShowMore({ children, height = 0 }: PropsWithChildren & { height?: number }) {
  return (
    <Spoiler
      maxHeight={height}
      showLabel="Show more"
      hideLabel="Show less"
      classNames={{
        control: '!font-semibold z-[5]',
      }}
    >
      {children}
    </Spoiler>
  )
}
