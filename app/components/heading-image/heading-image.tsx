import { Flex, Title, Container, BackgroundImage, Overlay } from '@mantine/core'
import { FC } from 'react'
import styles from './heading-image.module.scss'

export const HeadingImage: FC = () => {
  return (
    <Container mb="3rem" className={styles.container}>
      <Overlay
        zIndex={2}
        gradient="linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)"
      />
      <BackgroundImage src="/images/header-bg.jpeg" className={styles.bg} />
      <Flex className={styles.content}>
        <Title order={3} className={styles.title}>
          Industrial Era Barometer Collection
        </Title>
      </Flex>
    </Container>
  )
}
