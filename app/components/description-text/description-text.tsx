import { Spoiler, Text, TextProps } from '@mantine/core'

interface DescriptionTextProps extends TextProps {
  description: string
}

export const DescriptionText = ({ description, ...props }: DescriptionTextProps) => {
  const [firstParagraph, ...paragraphs] = description.split('\n')
  return (
    <>
      <Text {...props}>{firstParagraph}</Text>
      <Spoiler
        maxHeight={0}
        showLabel="Show more"
        hideLabel="Hide"
        styles={{ control: { color: '#242424', fontWeight: 600 } }}
      >
        {paragraphs.map((paragraph, i) => (
          <Text {...props} mb="md" key={i}>
            {paragraph}
          </Text>
        ))}
      </Spoiler>
    </>
  )
}
