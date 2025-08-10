import NextLink from 'next/link'
import NextImage from 'next/image'
import { FC } from 'react'
import { CategoryIcon } from '../category-icon'
import customImageLoader from '@/utils/image-loader'
import { cn } from '@/lib/utils'
import { CategoryDTO } from '@/app/types'

interface CategoryCardProps {
  name: string
  link: string
  image?: CategoryDTO['image']
  priority: boolean
}

/**
 * Landing page card with barometer category images and names
 */
export const CategoryCard: FC<CategoryCardProps> = ({ name, link, image, priority }) => {
  return (
    <NextLink href={link} className="block">
      <div className="aspect-square">
        <div
          className={cn(
            'relative h-full w-full overflow-hidden rounded-md @container',
            'bg-gradient-to-b from-card-gradient-from to-card-gradient-to',
          )}
        >
          <CategoryIcon category={name} className="absolute right-4 top-4 z-10" />
          {image && (
            <NextImage
              unoptimized
              fill
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              src={customImageLoader({ src: image.url, quality: 90, width: 600 })}
              alt={name}
              className={cn(
                'transition-all duration-5000 hover:scale-150 active:scale-150',
                'ease-out',
              )}
              style={{
                objectFit: name === 'Recorders' ? 'cover' : 'contain',
              }}
              placeholder="blur"
              blurDataURL={image.blurData}
            />
          )}
          <h3
            className={cn(
              'text-shadow-stroke pointer-events-none absolute bottom-4 left-4 @sm:bottom-8 @sm:left-8',
              'font-cinzel text-2xl font-medium capitalize text-card-foreground @sm:text-3xl @lg:text-4xl',
            )}
          >
            {name}
          </h3>
        </div>
      </div>
    </NextLink>
  )
}
