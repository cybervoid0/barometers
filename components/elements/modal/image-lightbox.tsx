'use client'

import NextImage from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { customImageLoader } from '@/utils'

interface ImageLightboxProps {
  src: string
  name?: string | null | undefined
}

export function ImageLightbox({ src, name }: ImageLightboxProps) {
  name ??= 'Image'
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NextImage
          unoptimized
          width={250}
          height={250}
          src={customImageLoader({ src, width: 250, quality: 80 })}
          alt={name}
          className="cursor-zoom-in"
          priority
        />
      </DialogTrigger>
      <DialogContent>
        <NextImage
          unoptimized
          width={1000}
          height={1000}
          src={customImageLoader({ src, width: 1000, quality: 80 })}
          alt={name}
          loading="lazy"
        />
      </DialogContent>
    </Dialog>
  )
}
