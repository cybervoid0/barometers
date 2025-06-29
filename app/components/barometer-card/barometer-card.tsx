import { Box, Anchor, BoxProps } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import customImageLoader from '@/utils/image-loader'
import { BarometerListDTO } from '@/app/types'

interface BarometerCardProps extends BoxProps {
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
    <Box {...props}>
      <Anchor
        underline="never"
        c="dark"
        className="block"
        component={Link}
        href={link}
      >
        <div className="relative flex h-60 w-full items-center justify-center rounded-md bg-[linear-gradient(180deg,_#fbfbfb,_#efefef)] bg-contain bg-center bg-no-repeat">
          {image ? (
            <NextImage
              unoptimized
              priority={priority}
              src={customImageLoader({
                src: image.url,
                quality: 95,
                width: 300,
              })}
              alt={name}
              fill
              style={{ objectFit: 'contain' }}
              placeholder="blur"
              blurDataURL={image.blurData ?? undefined}
            />
          ) : (
            <p>No image</p>
          )}
        </div>
        <p className="mb-1 text-center text-xs font-medium uppercase tracking-wider text-inherit">
          {name}
        </p>
        {manufacturer && manufacturer.toLowerCase() !== 'unknown' && (
          <p className="text-center text-[8px] font-medium uppercase leading-none tracking-wider text-inherit">
            {manufacturer}
          </p>
        )}
      </Anchor>
    </Box>
  )
}
