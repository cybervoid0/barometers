'use client'

import NextImage from 'next/image'
import { type PropsWithChildren, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { customImageLoader } from '@/utils'

interface ImageLightboxProps extends PropsWithChildren {
  src: string
  name?: string | null | undefined
}

export function ImageLightbox({ src, name, children }: ImageLightboxProps) {
  name ??= 'Image'
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <NextImage
            unoptimized
            width={250}
            height={250}
            src={customImageLoader({ src, width: 250, quality: 80 })}
            alt={name}
            className="cursor-zoom-in"
          />
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">Full size view of {name}</DialogDescription>
        <div className="relative w-full h-full bg-background rounded-lg overflow-hidden">
          <NextImage
            unoptimized
            fill
            src={customImageLoader({ src, width: 1500, quality: 90 })}
            alt={name}
            className="object-contain"
            loading="lazy"
          />
        </div>
        {name && name !== 'Image' && (
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded text-center border">
              {name}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
