'use client'

import { closestCorners, DndContext } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { ImageUp } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  LoadingOverlay,
} from '@/components/ui'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { MediaFile } from '@/types'
import { DragFiles } from '../drag-files'
import { SortableImage } from './sortable-image'

interface FormImageUploadProps {
  existingImages?: MediaFile[] // For edit mode - existing images from database
  isDialogOpen?: boolean // For dialog mode - reset to existing images on open
}
const fieldName = 'images'
const maxImages = 20
/**
 * Universal image upload component with drag & drop, reordering, and edit mode support
 */
function ImageUpload({ existingImages = [], isDialogOpen }: FormImageUploadProps) {
  const { pending, uploadFiles, handleDeleteFile, handleDragEnd } = useFileUpload({
    fieldName,
    existingFiles: existingImages,
    update: isDialogOpen,
  })
  const { control, watch } = useFormContext()
  const mediaFiles: MediaFile[] = watch(fieldName) ?? []

  return (
    <FormField
      control={control}
      name={fieldName}
      render={() => (
        <FormItem className="relative">
          {pending && <LoadingOverlay />}
          <FormLabel>Images</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <DragFiles
                onFileSelect={uploadFiles}
                disabled={pending}
                currentCount={mediaFiles.length}
                maxFiles={maxImages}
                icon={ImageUp}
                message="Drop images here or click to select"
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
              />

              {mediaFiles.length > 0 && (
                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={mediaFiles.map(({ url }) => url)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="flex gap-4 flex-wrap">
                      {mediaFiles.map(({ url }, i) => (
                        <SortableImage
                          key={url}
                          fileName={url}
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
