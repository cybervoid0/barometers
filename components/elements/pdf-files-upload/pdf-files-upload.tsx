'use client'

import { closestCorners, DndContext } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { FileUp } from 'lucide-react'
import type { ComponentProps } from 'react'
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
import { SortablePdfFile } from './sortable-pdf-file'

interface Props extends ComponentProps<'div'> {
  existingFiles?: MediaFile[]
  isDialogOpen?: boolean
  /** form field that holds the uploaded files (defaults to `pdfFiles`) */
  fieldName?: string
  /** maximum number of files allowed (defaults to 20) */
  maxFiles?: number
  /** field label (defaults to `PDF Files`) */
  label?: string
  /** drop-zone prompt */
  message?: string
}

export function PdfFilesUpload({
  existingFiles,
  isDialogOpen,
  fieldName = 'pdfFiles',
  maxFiles = 20,
  label = 'PDF Files',
  message = 'Drop PDFs here or click to select',
  ...props
}: Props) {
  const { pending, uploadFiles, handleDeleteFile, handleDragEnd } = useFileUpload({
    fieldName,
    existingFiles,
    update: isDialogOpen,
  })
  const form = useFormContext()
  const formFiles: MediaFile[] = form.watch(fieldName) ?? []

  return (
    <div {...props}>
      <FormField
        control={form.control}
        name={fieldName}
        render={() => (
          <FormItem className="relative">
            {pending && <LoadingOverlay />}
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <DragFiles
                  onFileSelect={uploadFiles}
                  icon={FileUp}
                  message={message}
                  acceptedTypes={['application/pdf']}
                  currentCount={formFiles.length}
                  maxFiles={maxFiles}
                />

                {formFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded files:</p>
                    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                      <SortableContext
                        items={formFiles.map(({ url }) => url)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="space-y-2">
                          {formFiles.map((file, index) => (
                            <SortablePdfFile
                              key={file.url}
                              file={file}
                              index={index}
                              onDelete={handleDeleteFile}
                              fieldName={fieldName}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
