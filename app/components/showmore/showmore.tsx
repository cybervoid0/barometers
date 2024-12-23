import { Spoiler } from '@mantine/core'
import { PropsWithChildren } from 'react'
import sx from './styles.module.scss'

export function ShowMore({ children, height = 0 }: PropsWithChildren & { height?: number }) {
  return (
    <Spoiler
      maxHeight={height}
      showLabel="Show more"
      hideLabel="Show less"
      classNames={{
        control: sx.showMore,
      }}
    >
      {children}
    </Spoiler>
  )
}
