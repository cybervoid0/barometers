import { Spoiler, Text } from '@mantine/core'

export const DescriptionText = ({ description }: { description: string }) => {
  const [firstParagraph, ...paragraphs] = description.split('\n')
  return (
    <>
      <Text size="sm">{firstParagraph}</Text>
      <Spoiler
        maxHeight={0}
        showLabel="Show more"
        hideLabel="Hide"
        styles={{ control: { color: '#242424', fontWeight: 600 } }}
      >
        {paragraphs.map((paragraph, i) => (
          <Text size="sm" mb="md" key={i}>
            {paragraph}
          </Text>
        ))}
      </Spoiler>
    </>
  )
}
