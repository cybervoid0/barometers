import { type HTMLAttributes } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import customImageLoader from '@/utils/image-loader'
import { BarometerListDTO } from '@/app/types'
import { cn } from '@/lib/utils'

interface BarometerCardProps extends HTMLAttributes<HTMLDivElement> {
  image?: BarometerListDTO['barometers'][number]['images'][number]
  name: string
  link: string
  manufacturer?: string
  priority: boolean
}

export async function BarometerCard({
  name,
  image,
  link,
  manufacturer,
  priority,
  ...props
}: BarometerCardProps) {
  return (
    <div {...props}>
      <Link
        className={cn(
          'flex h-full w-full flex-col gap-1 rounded-md p-2 text-center',
          'bg-gradient-to-b from-card-gradient-from to-card-gradient-to',
        )}
        href={link}
      >
        <div className="relative h-60 w-full bg-contain bg-center bg-no-repeat">
          {image ? (
            <NextImage
              unoptimized
              priority={priority}
              src={customImageLoader({ src: image.url, quality: 95, width: 300 })}
              alt={name}
              fill
              className="object-contain"
              placeholder="blur"
              blurDataURL={image.blurData ?? undefined}
            />
          ) : (
            <p>No image</p>
          )}
        </div>
        <p className="text-xs font-medium uppercase tracking-wider">{name}</p>
        {manufacturer && manufacturer.toLowerCase() !== 'unknown' && (
          <p className="text-[8px] font-medium uppercase tracking-wider">{manufacturer}</p>
        )}
      </Link>
    </div>
  )
}
