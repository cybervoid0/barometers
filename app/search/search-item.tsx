import { Text, Group, Anchor, Box, Stack, Paper } from '@mantine/core'
import Image from 'next/image'
import Link from 'next/link'
import styles from './style.module.css'
import { SearchResultsDTO } from '../types'
import customImageLoader from '@/utils/image-loader'

interface ItemProps {
  image: SearchResultsDTO['barometers'][number]['image']
  name: string
  link: string
  manufacturer?: string
  dating?: string
}

export function SearchItem({
  image,
  link,
  name,
  manufacturer,
  dating,
}: ItemProps) {
  const noManufacturer =
    !manufacturer || manufacturer.toLowerCase() === 'unsigned'
  return (
    <Paper shadow="sm" className={styles.paper}>
      <Anchor
        c="dark"
        w="fit-content"
        display="block"
        component={Link}
        href={link}
      >
        <Group gap="0.5rem" wrap="nowrap">
          <Box className={styles.image}>
            {image && (
              <Image
                unoptimized
                fill
                alt={name}
                src={customImageLoader({
                  src: image.url,
                  width: 100,
                  quality: 80,
                })}
                style={{ objectFit: 'contain' }}
                placeholder="blur"
                blurDataURL={image.blurData}
              />
            )}
          </Box>
          <Stack gap="xs" justify="center" mih="70px">
            <Text tt="capitalize" fw={500} lh="100%">
              {name}
            </Text>
            <Text size="xs">
              {!noManufacturer && manufacturer}{' '}
              {!noManufacturer && dating && <>&mdash;</>} {dating && dating}
            </Text>
          </Stack>
        </Group>
      </Anchor>
    </Paper>
  )
}
