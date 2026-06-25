'use client'

import { useState } from 'react'
import { Image, ImageLightbox } from '@/components/elements'
import { cn } from '@/utils'

interface GalleryImage {
  id: string
  url: string
  name: string | null
}

interface Props {
  images: GalleryImage[]
  productName: string
}

/**
 * Product image gallery: a large main image (opens full-size in a lightbox) with
 * a thumbnail strip that switches the main image.
 */
export function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) return null

  const main = images[Math.min(active, images.length - 1)]

  return (
    <div className="space-y-3">
      <ImageLightbox src={main.url} name={main.name ?? productName}>
        <button type="button" className="block w-full cursor-zoom-in">
          <Image
            src={main.url}
            alt={main.name ?? productName}
            width={600}
            height={600}
            className="aspect-square w-full select-none rounded-lg object-cover"
          />
        </button>
      </ImageLightbox>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                'overflow-hidden rounded-md border-2 transition-colors',
                index === active ? 'border-secondary' : 'border-transparent hover:border-border',
              )}
            >
              <Image
                src={img.url}
                alt={img.name ?? productName}
                width={72}
                height={72}
                className="h-[72px] w-[72px] select-none object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
