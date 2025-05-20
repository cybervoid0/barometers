'use client'

import NextImage from 'next/image'
import { useDisclosure } from '@mantine/hooks'
import { ZoomModal } from './zoom-modal'
import customImageLoader from '@/utils/image-loader'

interface ImageLightboxProps {
  src: string
  name?: string | null | undefined
}

export function ImageLightbox({ src, name }: ImageLightboxProps) {
  name ??= 'Image'
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <NextImage
        unoptimized
        width={250}
        height={250}
        src={customImageLoader({ src, width: 250, quality: 80 })}
        alt={name}
        className="w-2/3 cursor-zoom-in sm:w-[250px]"
        onClick={open}
        priority
      />

      <ZoomModal isOpened={opened} close={close}>
        {({ onLoad }) => (
          <NextImage
            unoptimized
            className="h-auto max-h-screen w-auto"
            width={1000}
            height={1000}
            src={customImageLoader({ src, width: 1000, quality: 80 })}
            alt={name}
            loading="lazy"
            onLoad={onLoad}
          />
        )}
      </ZoomModal>
    </>
  )
}
