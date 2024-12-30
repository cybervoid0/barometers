import { AspectRatio, Title, Anchor, Box } from '@mantine/core'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { FC } from 'react'
import styles from './category-card.module.scss'
import { CategoryDTO } from '@/app/types'

interface CategoryCardProps {
  name: string
  link: string
  image?: CategoryDTO['image']
  priority: boolean
}

export const CategoryCard: FC<CategoryCardProps> = ({ name, link, image, priority }) => {
  return (
    <Anchor component={NextLink} href={link}>
      <AspectRatio ratio={1}>
        <Box className={styles.container}>
          {image && (
            <NextImage
              fill
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              quality={50}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={image.url}
              alt={name}
              className={styles.bg_image}
              style={{
                objectFit: name === 'Recorders' ? 'cover' : 'contain',
              }}
              placeholder="blur"
              blurDataURL={image.blurData}
            />
          )}
          <Title component="h3" className={styles.title}>
            {name}
          </Title>
        </Box>
      </AspectRatio>
    </Anchor>
  )
}
