import { Box, Flex, Title } from '@mantine/core'
import { FC } from 'react'
import styles from './heading-image.module.scss'

export const HeadingImage: FC = () => {
  return (
    <Box className={styles.container}>
      <Box className={styles.bg} />
      <Flex className={styles.content}>
        <Title order={3} className={styles.heading}>
          Industrial Era Barometer Collection
        </Title>
      </Flex>
    </Box>
  )
}
