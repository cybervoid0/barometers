'use client'

import { type PropsWithChildren, useState } from 'react'
import { Image } from '@/components/elements'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ImageLightboxProps extends PropsWithChildren {
  src: string
  name?: string | null | undefined
}

const defaultImageName = 'Full-size image'

export function ImageLightbox({ src, name, children }: ImageLightboxProps) {
  const imageName = name ?? defaultImageName
  const [open, setOpen] = useState(false)

  /** Disables context menu */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <div className="rounded-md p-4 sm:h-[20rem] sm:w-sm border">
            <Image
              width={250}
              height={250}
              src={src}
              alt={imageName}
              className="object-contain h-full w-full max-w-sm sm:max-w-none max-h-[30rem] cursor-zoom-in select-none"
              draggable={false}
              onContextMenu={handleContextMenu}
            />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-4 bg-background">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">Full size view of {name}</DialogDescription>
        <div className="w-full h-full flex flex-col gap-0 overflow-hidden">
          <div className="flex-1 min-h-0">
            <Image
              width={1500}
              height={1500}
              src={src}
              alt={imageName}
              className="object-contain select-none w-full h-full"
              loading="lazy"
              draggable={false}
              onContextMenu={handleContextMenu}
            />
          </div>
          {name && (
            <div className="pt-3 flex-shrink-0 bg-background/80 backdrop-blur-sm border-t border-border">
              <h3 className="text-center">{name}</h3>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
