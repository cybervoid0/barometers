import { Flex, Title, Container, Overlay } from '@mantine/core'
import NextImage from 'next/image'
import { FC } from 'react'
import styles from './heading-image.module.scss'
import { googleStorageImagesFolder } from '@/app/constants'

export const HeadingImage: FC = () => {
  return (
    <Container mb="3rem" className={styles.container}>
      <Overlay
        zIndex={2}
        gradient="linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)"
      />
      <NextImage
        priority
        quality={50}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt="Barograph"
        src={`${googleStorageImagesFolder}65c97a01-7ab7-4670-9353-78e46df2ea3d.png`}
        fill
        className={styles.bg}
      />
      <Flex className={styles.content}>
        <Title order={3} className={styles.title}>
          Industrial Era Barometer Collection
        </Title>
      </Flex>
    </Container>
  )
}
