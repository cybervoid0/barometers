import { type HTMLAttributes } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { customImageLoader, cn } from '@/utils'
import { BarometerListDTO } from '@/types'

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
  className,
  ...props
}: BarometerCardProps) {
  return (
    <div className={cn('h-full', className)} {...props}>
      <Link
        className={cn(
          'flex h-full w-full flex-col gap-1 rounded-md p-2 text-center no-underline',
          'from-card-gradient-from to-card-gradient-to bg-linear-to-b',
        )}
        href={link}
      >
        <div className="relative h-60 w-full bg-contain bg-center bg-no-repeat">
          {image ? (
            <Image
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
        <p className="text-xs font-medium tracking-wider uppercase">{name}</p>
        {manufacturer && manufacturer.toLowerCase() !== 'unknown' && (
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            {manufacturer}
          </p>
        )}
      </Link>
    </div>
  )
}
