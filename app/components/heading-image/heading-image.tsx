import { Box, Title, Container } from '@mantine/core'
import NextImage from 'next/image'
import { FC } from 'react'
import styles from './heading-image.module.scss'
import customImageLoader from '@/utils/image-loader'

export const HeadingImage: FC = () => {
  return (
    <Container className={styles.componentContainer}>
      <NextImage
        unoptimized
        priority
        alt="Barograph"
        src={customImageLoader({ src: '/shared/landing-header.png', width: 1000, quality: 80 })}
        fill
        className={styles.image}
      />
      <Box className={styles.textContainer}>
        <Box>
          <Title component="h2" order={3} className={styles.title}>
            Industrial Era Barometer Collection
          </Title>
        </Box>
      </Box>
    </Container>
  )
}
