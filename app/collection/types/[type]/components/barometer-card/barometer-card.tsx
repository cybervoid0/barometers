import { Box, Text, Anchor } from '@mantine/core'
import Link from 'next/link'
import NextImage from 'next/image'
import styles from './styles.module.scss'

interface BarometerCardProps {
  image: string
  name: string
  link: string
  manufacturer?: string
  priority: boolean
}

export async function BarometerCard({
  name,
  image,
  link,
  manufacturer,
  priority,
}: BarometerCardProps) {
  return (
    <Box>
      <Anchor c="dark" component={Link} href={link}>
        <Box className={styles.bg_gradient}>
          <NextImage
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            quality={50}
            src={image}
            alt={name}
            fill
            sizes="(max-width: 575px) 50vw, (max-width: 1350px) 25vw, 20vw"
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Text size="xs" fw={500} lts={1} tt="uppercase" ta="center">
          {name}
        </Text>
        {manufacturer && manufacturer.toLowerCase() !== 'unknown' && (
          <Text size="8px" fw={500} lts={1} tt="uppercase" ta="center">
            {manufacturer}
          </Text>
        )}
      </Anchor>
    </Box>
  )
}
