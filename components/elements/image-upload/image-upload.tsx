'use client'

import { closestCorners, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useCallback, useEffect, useTransition } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { LoadingOverlay } from '@/components/ui'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { deleteImage, deleteImages } from '@/server/images/actions'
import { storeImages } from '@/server/images/upload'
import { DragImages } from './drag-images'
import { SortableImage } from './sortable-image'

interface FormImageUploadProps {
  existingImages?: string[] // For edit mode - existing images from database
  isDialogOpen?: boolean // For dialog mode - reset to existing images on open
}
const imagesField = 'images'
const maxImages = 20
/**
 * Universal image upload component with drag & drop, reordering, and edit mode support
 */
function ImageUpload({ existingImages = [], isDialogOpen }: FormImageUploadProps) {
  const [pending, startTransition] = useTransition()
  const { control, watch, clearErrors, setValue, getValues } = useFormContext()
  const { append, remove } = useFieldArray({ control, name: imagesField })

  const formImages: string[] = watch(imagesField) || []

  // update form on dialog open if the component is inside a dialog
  useEffect(() => {
    if (!isDialogOpen) return
    setValue(imagesField, existingImages)
  }, [isDialogOpen, setValue, existingImages])

  // cleanup temporary files on component unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup only on unmount
  useEffect(() => {
    return () => {
      // Get current form state at cleanup time
      const currentImages = getValues(imagesField) as string[] | undefined
      if (!Array.isArray(currentImages) || currentImages.length === 0) return
      // Only delete temporary images (not existing ones)
      const tempImages = currentImages.filter(img => img.startsWith('temp/'))
      if (tempImages.length > 0) deleteImages(tempImages).catch(console.error)
    }
  }, []) // Empty deps = cleanup only on unmount

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    startTransition(async () => {
      try {
        append(await storeImages(Array.from(files)))
        clearErrors(imagesField)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error uploading files')
      }
    })
  }

  const handleDeleteFile = async (index: number) => {
    try {
      const fileName = formImages.at(index)
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
        const oldIndex = formImages.indexOf(String(active.id))
        const newIndex = formImages.indexOf(String(over.id))
        const newOrder = arrayMove(formImages, oldIndex, newIndex)
        setValue(imagesField, newOrder, { shouldDirty: true })
      }
    },
    [formImages, setValue],
  )

  return (
    <FormField
      control={control}
      name={imagesField}
      render={() => (
        <FormItem className="relative">
          {pending && <LoadingOverlay />}
          <FormLabel>Images</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <DragImages
                onFileSelect={uploadImages}
                disabled={pending}
                currentCount={formImages.length}
                maxImages={maxImages}
              />

              {formImages.length > 0 && (
                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                  <SortableContext items={formImages} strategy={rectSortingStrategy}>
                    <div className="flex gap-4 flex-wrap">
                      {formImages.map((fileName, i) => (
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
export { ImageUpload }
