import { Text, Group, Image, Anchor, Box, Stack, Paper } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import styles from './style.module.css'

interface ItemProps {
  image?: string
  name: string
  link: string
  manufacturer?: string
  dating?: string
}

export function SearchItem({ image, link, name, manufacturer, dating }: ItemProps) {
  const noManufacturer = !manufacturer || manufacturer.toLowerCase() === 'unsigned'
  return (
    <Paper shadow="sm" className={styles.paper}>
      <Anchor c="dark" w="fit-content" display="block" component={Link} href={link}>
        <Group gap="0.5rem" wrap="nowrap">
          <Box className={styles.image}>
            <Image
              component={NextImage}
              fill
              alt={name}
              src={image}
              style={{ objectFit: 'contain' }}
              sizes="100px"
            />
          </Box>
          <Stack gap="xs" justify="center" mih="70px">
            <Text fw={400} lh="100%">
              {name}
            </Text>
            <Text size="xs">
              {!noManufacturer && manufacturer} {!noManufacturer && dating && <>&mdash;</>}{' '}
              {dating && dating}
            </Text>
          </Stack>
        </Group>
      </Anchor>
    </Paper>
  )
}
