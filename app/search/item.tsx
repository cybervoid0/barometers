import { Text, Group, Image, Anchor, Box } from '@mantine/core'
import NextImage from 'next/image'

interface ItemProps {
  image?: string
  name: string
  link: string
  manufacturer?: string
}

export function Item({ image, link, name, manufacturer }: ItemProps) {
  return (
    <Anchor c="dark" href={link}>
      <Group gap="0.5rem" w="fit-content">
        <Box pos="relative" w="50px" h="50px">
          <Image
            component={NextImage}
            fill
            alt={name}
            src={image}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Text>{name}</Text>
        <Text size="xs">{manufacturer}</Text>
      </Group>
    </Anchor>
  )
}
