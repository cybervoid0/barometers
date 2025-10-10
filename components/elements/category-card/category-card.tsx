import NextLink from 'next/link'
import type { FC } from 'react'
import { Image } from '@/components/elements'
import type { CategoryDTO } from '@/server/categories/queries'
import { cn } from '@/utils'
import { CategoryIcon } from '../category-icon'

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
            '@container relative h-full w-full overflow-hidden rounded-md',
            'from-card-gradient-from to-card-gradient-to bg-linear-to-b',
          )}
        >
          <CategoryIcon category={name} className="absolute top-4 right-4 z-10" />
          {image && (
            <Image
              width={509}
              height={509}
              priority={priority}
              fetchPriority={priority ? 'high' : 'auto'}
              loading={priority ? 'eager' : 'lazy'}
              src={image.url}
              alt={name}
              className={cn(
                'w-full h-full',
                'transition-all duration-5000 hover:scale-150 active:scale-150',
                'ease-out',
              )}
              style={{
                objectFit: name === 'Recorders' ? 'cover' : 'contain',
              }}
              placeholder="blur"
              blurDataURL={image.blurData ?? undefined}
            />
          )}
          <h3
            className={cn(
              'text-shadow-stroke pointer-events-none absolute bottom-4 left-4 @sm:bottom-8 @sm:left-8',
              'font-cinzel text-card-foreground text-2xl font-medium capitalize @sm:text-3xl @lg:text-4xl',
            )}
          >
            {name}
          </h3>
        </div>
      </div>
    </NextLink>
  )
}
