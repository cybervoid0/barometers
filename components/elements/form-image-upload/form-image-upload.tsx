'use client'

import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useTransition } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { deleteImage } from '@/server/images/actions'
import { storeImages } from '@/server/images/upload'
import { customImageLoader } from '@/utils'
import { DragImages } from './drag-images'

function SortableImage({
  fileName,
  index,
  handleDelete,
}: {
  fileName: string
  index: number
  handleDelete: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: fileName,
  })

  return (
    <div
      className="relative w-[100px] h-[100px]"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
      <div className="aspect-square relative" {...listeners}>
        <Image
          unoptimized
          alt={`Upload ${index + 1}`}
          src={customImageLoader({ src: fileName, width: 100, quality: 90 })}
          fill
          className="object-cover rounded-lg absolute"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full"
        onClick={() => handleDelete(index)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface FormImageUploadProps {
  existingImages?: string[] // For edit mode - existing images from database
  isDialogOpen?: boolean // For dialog mode - reset to existing images on open
}
const imagesField = 'images'
const maxImages = 20
export function FormImageUpload({ existingImages = [], isDialogOpen }: FormImageUploadProps) {
  const [pending, startTransition] = useTransition()
  const { control, watch, clearErrors, setValue } = useFormContext()
  const { append, remove } = useFieldArray({ control, name: imagesField })

  const fileNames: string[] = watch(imagesField) || []

  useEffect(() => {
    if (!isDialogOpen) return
    setValue(imagesField, existingImages)
  }, [isDialogOpen, setValue, existingImages])

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    startTransition(async () => {
      try {
        // upload files to Minio
        append(await storeImages(Array.from(files)))
        clearErrors(imagesField)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error uploading files')
      }
    })
  }

  const handleDeleteFile = async (index: number) => {
    try {
      const fileName = fileNames.at(index)
      if (!fileName) throw new Error('File does not exist')

      // Only delete from storage if it's a new temporary image (not existing)
      if (!existingImages.includes(fileName)) {
        await deleteImage(fileName)
      }

      remove(index)
      clearErrors(imagesField)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting file')
    }
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return
      if (active.id !== over.id) {
        const oldIndex = fileNames.indexOf(String(active.id))
        const newIndex = fileNames.indexOf(String(over.id))
        const newOrder = arrayMove(fileNames, oldIndex, newIndex)
        setValue(imagesField, newOrder, { shouldDirty: true })
      }
    },
    [fileNames, setValue],
  )

  return (
    <FormField
      control={control}
      name={imagesField}
      render={() => (
        <FormItem>
          <FormLabel>Images</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <DragImages
                onFileSelect={uploadImages}
                disabled={pending}
                currentCount={fileNames.length}
                maxImages={maxImages}
              />

              {fileNames.length > 0 && (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fileNames} strategy={horizontalListSortingStrategy}>
                    <div className="flex gap-4 flex-wrap">
                      {fileNames.map((fileName, i) => (
                        <SortableImage
                          key={fileName}
                          fileName={fileName}
                          index={i}
                          handleDelete={handleDeleteFile}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
