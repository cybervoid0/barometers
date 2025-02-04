'use client'

import { Spoiler, Box, BoxProps } from '@mantine/core'
import { MD } from '@/app/components/md'

interface DescriptionTextProps extends BoxProps {
  description: string
}

export const DescriptionText = ({ description, ...props }: DescriptionTextProps) => {
  const [firstParagraph, ...paragraphs] = description.split('\n')
  return (
    <Box {...props}>
      <MD>{firstParagraph}</MD>
      <Spoiler
        maxHeight={0}
        showLabel="Show more"
        hideLabel="Hide"
        styles={{ control: { color: '#242424', fontWeight: 600 } }}
      >
        <MD>{paragraphs.join('\n')}</MD>
      </Spoiler>
    </Box>
  )
}
