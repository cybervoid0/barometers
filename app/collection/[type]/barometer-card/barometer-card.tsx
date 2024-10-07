import { Box, Paper, Stack, Text } from '@mantine/core'
import React from 'react'
import styles from './styles.module.scss'
import { googleStorageImagesFolder } from '@/app/constants'

interface BarometerCardProps {
  image: string
  name: string
}

export async function BarometerCard({ name, image }: BarometerCardProps) {
  return (
    <Paper bg="none">
      <Stack>
        <Box
          className={styles.image}
          style={{
            backgroundImage: `
              url(${googleStorageImagesFolder + image}), 
              linear-gradient(180deg, #fbfbfb, #efefef)`,
          }}
        />
        <Text size="xs" fw={500} lts={1} tt="uppercase" ta="center">
          {name}
        </Text>
      </Stack>
    </Paper>
  )
}
