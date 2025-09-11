'use client'

import { Upload, X } from 'lucide-react'
import { useCallback, useRef, useTransition } from 'react'
import { toast } from 'sonner'
import * as UI from '@/components/ui'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  acceptedTypes?: string[]
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      if (images.length + files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }

      startTransition(() => {
        const newImages: string[] = []

        try {
          for (const file of Array.from(files)) {
            if (!acceptedTypes.includes(file.type)) {
              toast.error(`File type ${file.type} is not supported`)
              continue
            }

            if (file.size > 5 * 1024 * 1024) {
              toast.error(`File ${file.name} is too large (max 5MB)`)
              continue
            }

            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file)
            newImages.push(objectUrl)
          }

          if (newImages.length > 0) {
            onImagesChange([...images, ...newImages])
          }
        } catch (error) {
          toast.error('Error processing images')
          console.error('Processing error:', error)
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      })
    },
    [images, onImagesChange, maxImages, acceptedTypes],
  )

  const handleRemoveImage = useCallback(
    (index: number) => {
      const imageToRemove = images[index]
      // Revoke object URL to free memory
      if (imageToRemove?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove)
      }
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    },
    [images, onImagesChange],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [handleFileSelect],
  )

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={isPending}
        className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload images"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isPending ? 'Processing...' : 'Drop images here or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 5MB each (max {maxImages} images)
          </p>
          <p className="text-xs text-muted-foreground">
            {images.length}/{maxImages} images selected
          </p>
        </div>
      </button>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {/** biome-ignore lint/performance/noImgElement: Preview image for upload */}
                <img
                  src={image}
                  alt={`Upload preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <UI.Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-3 w-3" />
              </UI.Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
