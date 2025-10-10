import Link from 'next/link'
import type { HTMLAttributes } from 'react'
import { Image } from '@/components/elements'
import { cn } from '@/utils'

interface BarometerCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  link: string
  priority: boolean
  manufacturer?: string
  image?: {
    url: string
    order: number | null
    blurData: string | null
  }
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
        <div className="h-60 w-full bg-contain bg-center bg-no-repeat">
          {image ? (
            <Image
              width={300}
              height={300}
              priority={priority}
              src={image.url}
              alt={name}
              className="w-full h-full object-contain"
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
