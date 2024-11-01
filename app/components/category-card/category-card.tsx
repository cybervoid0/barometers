import { AspectRatio, Title, Anchor, Box } from '@mantine/core'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { FC } from 'react'
import styles from './category-card.module.scss'

interface CategoryCardProps {
  name: string
  link: string
  image: string
}

export const CategoryCard: FC<CategoryCardProps> = ({ name, link, image }) => {
  return (
    <Anchor component={NextLink} href={link}>
      <AspectRatio ratio={1}>
        <Box className={styles.container}>
          <NextImage
            fill
            priority
            quality={50}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={image}
            alt={name}
            className={styles.bg_image}
          />
          <Title className={styles.title}>{name}</Title>
        </Box>
      </AspectRatio>
    </Anchor>
  )
}
