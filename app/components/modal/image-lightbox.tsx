'use client'

import NextImage from 'next/image'
import { useDisclosure } from '@mantine/hooks'
import { ZoomModal } from './zoom-modal'

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
        width={250}
        height={250}
        src={src}
        alt={name}
        className="w-2/3 cursor-zoom-in sm:w-[250px]"
        onClick={open}
        priority
      />

      <ZoomModal isOpened={opened} close={close}>
        {({ onLoad }) => (
          <NextImage
            className="h-auto max-h-screen w-auto"
            width={1000}
            height={1000}
            quality={100}
            src={src}
            alt={name}
            loading="lazy"
            onLoad={onLoad}
          />
        )}
      </ZoomModal>
    </>
  )
}
