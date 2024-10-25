import { Box, Text, Anchor } from '@mantine/core'
import Link from 'next/link'
import NextImage from 'next/image'
import styles from './styles.module.scss'

interface BarometerCardProps {
  image: string
  name: string
  link: string
  manufacturer?: string
}

export async function BarometerCard({ name, image, link, manufacturer }: BarometerCardProps) {
  return (
    <Box>
      <Anchor c="dark" component={Link} href={link}>
        <Box className={styles.bg_gradient}>
          <NextImage
            priority
            quality={50}
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
