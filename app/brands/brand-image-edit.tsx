'use client'

import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ImagePlus, X } from 'lucide-react'
import NextImage from 'next/image'
import { type TransitionStartFunction, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { createImageUrls, deleteImage } from '@/server/images/actions'
import { uploadFileToCloud } from '@/server/images/upload'
import type { BrandEditForm } from './brand-edit-schema'

interface Props {
  imageUrls: string[]
  form: UseFormReturn<BrandEditForm>
  startTransition: TransitionStartFunction
}

function SortableImage({
  image,
  handleDelete,
}: {
  image: string
  handleDelete: (image: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image,
  })

  return (
    <div
      className="relative shrink-0"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
      <button
        type="button"
        className="text-muted-foreground absolute top-1 right-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
        aria-label="Remove image"
        onClick={() => handleDelete(image)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div {...listeners}>
        <NextImage
          className="h-auto w-auto"
          alt="Barometer"
          key={image}
          src={image}
          width={100}
          height={200}
        />
      </div>
    </div>
  )
}

export function BrandImageEdit({ imageUrls, form, startTransition }: Props) {
  /**
   * Upload images to storage
   */
  const uploadImages = useCallback(
    (files: File[]) => {
      if (!files || !Array.isArray(files) || files.length === 0) return
      startTransition(async () => {
        try {
          const urlsDto = await createImageUrls(
            files.map(file => ({
              fileName: file.name,
              contentType: file.type,
            })),
          )
          await Promise.all(
            urlsDto.urls.map((urlObj, index) => uploadFileToCloud(urlObj.signed, files[index])),
          )

          const newImages = urlsDto.urls.map(url => url.public).filter(url => Boolean(url))
          const prev = form.getValues('images') || []
          form.setValue('images', [...prev, ...newImages], { shouldDirty: true })
        } catch (error) {
          console.error(error instanceof Error ? error.message : 'Error uploading files')
        }
      })
    },
    [form.getValues, form.setValue, startTransition],
  )

  const handleDeleteFile = useCallback(
    (img: string) => {
      startTransition(async () => {
        try {
          // if the image file was uploaded but not yet added to the entity
          if (!imageUrls?.includes(img)) await deleteImage(img)
          const old = form.getValues('images') || []
          form.setValue(
            'images',
            old.filter(file => !file.includes(img)),
            { shouldDirty: true },
          )
        } catch (error) {
          console.error(error instanceof Error ? error.message : 'Error deleting file')
        }
      })
    },
    [imageUrls, form.getValues, form.setValue, startTransition],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return
      if (active.id !== over.id) {
        const images = form.getValues('images') || []
        const oldIndex = images.indexOf(String(active.id))
        const newIndex = images.indexOf(String(over.id))

        const newOrder = arrayMove(images, oldIndex, newIndex)
        form.setValue('images', newOrder, { shouldDirty: true })
      }
    },
    [form.getValues, form.setValue],
  )

  return (
    <div className="relative">
      <div className="mb-1 text-sm font-medium">Images</div>
      <div className="flex flex-nowrap gap-2">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={form.getValues('images') || []}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grow overflow-x-auto">
              <div className="flex flex-nowrap gap-1">
                {(form.watch('images') || []).map(img => (
                  <SortableImage key={img} image={img} handleDelete={handleDeleteFile} />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>

        <UploadButton onFiles={uploadImages} />
      </div>
    </div>
  )
}

function UploadButton({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputId = 'manufacturer-upload-input'
  return (
    <div className="shrink-0">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={e => {
          const files = Array.from(e.target.files || [])
          onFiles(files)
          // reset input to allow uploading the same file twice
          e.currentTarget.value = ''
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Add images"
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
    </div>
  )
}
