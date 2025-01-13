import { Box, Title, Container } from '@mantine/core'
import NextImage from 'next/image'
import { FC } from 'react'
import styles from './heading-image.module.scss'
import headingImage from '@/public/images/landing-header.png'

export const HeadingImage: FC = () => {
  return (
    <Container className={styles.componentContainer}>
      <NextImage
        priority
        quality={80}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt="Barograph"
        src={headingImage}
        fill
        className={styles.image}
        placeholder="blur"
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
