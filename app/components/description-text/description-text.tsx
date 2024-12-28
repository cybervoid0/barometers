'use client'

import { Spoiler, TextProps } from '@mantine/core'
import { MD } from '../md'

interface DescriptionTextProps extends TextProps {
  description: string
}

export const DescriptionText = ({ description }: DescriptionTextProps) => {
  const [firstParagraph, ...paragraphs] = description.split('\n')
  return (
    <>
      <MD>{firstParagraph}</MD>
      <Spoiler
        maxHeight={0}
        showLabel="Show more"
        hideLabel="Hide"
        styles={{ control: { color: '#242424', fontWeight: 600 } }}
      >
        {paragraphs.map((paragraph, i) => (
          <MD key={i}>{paragraph}</MD>
        ))}
      </Spoiler>
    </>
  )
}
