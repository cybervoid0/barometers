import { AspectRatio, Title, Anchor, Box } from '@mantine/core'
import clsx from 'clsx'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { FC } from 'react'
import { CategoryDTO } from '@/app/types'
import { CategoryIcon } from '../category-icon'
import { googleStorageImagesFolder } from '@/utils/constants'

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
        <Box
          className={clsx(
            'relative h-full w-full overflow-hidden rounded-md',
            'bg-page-bg sm:bg-gradient-to-b sm:from-card-bg sm:to-page-bg',
          )}
        >
          <CategoryIcon
            bgColor="transparent"
            size={45}
            category={name}
            className="absolute right-1 top-2"
          />
          {image && (
            <NextImage
              fill
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              quality={80}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={googleStorageImagesFolder + image.url}
              alt={name}
              className={clsx(
                'transition-transform duration-[10s] hover:scale-150 active:scale-150',
                'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
              )}
              style={{
                objectFit: name === 'Recorders' ? 'cover' : 'contain',
              }}
              placeholder="blur"
              blurDataURL={image.blurData}
            />
          )}
          <Title
            unstyled
            component="h3"
            className={clsx(
              'pointer-events-none absolute bottom-8 left-8 bg-primary px-1',
              'text-lg uppercase leading-snug tracking-widest text-white',
            )}
          >
            {name}
          </Title>
        </Box>
      </AspectRatio>
    </Anchor>
  )
}
