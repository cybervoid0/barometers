'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { deleteFile, deleteFiles } from '@/server/files/actions'
import type { MediaFile } from '@/types'
import { createUploadUppy, uploadedFileToMediaFile } from '@/utils/upload'

interface Props {
  fieldName: string
  existingFiles?: MediaFile[]
  update?: boolean
}

export function useFileUpload({ fieldName, existingFiles, update }: Props) {
  const [pending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)
  const { control, clearErrors, setValue, getValues } = useFormContext()
  const { append, remove } = useFieldArray({ control, name: fieldName })
  // headless Uppy instance: presigned PUT with retries; compress only images > 30 MB
  const uppy = useMemo(() => createUploadUppy(), [])

  // track overall upload progress and tear the instance down on unmount
  useEffect(() => {
    const handleProgress = (value: number) => setProgress(value)
    uppy.on('progress', handleProgress)
    return () => {
      uppy.off('progress', handleProgress)
      uppy.destroy()
    }
  }, [uppy])

  // update form
  useEffect(() => {
    if (!update) return
    setValue(fieldName, existingFiles)
  }, [update, setValue, existingFiles, fieldName])

  // cleanup temporary files on component unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup only on unmount
  useEffect(() => {
    return () => {
      // Get current form state at cleanup time
      const currentFiles = (getValues(fieldName) ?? []) as MediaFile[]
      if (currentFiles.length === 0) return
      // Only delete temporary files (not existing ones)
      const tempFiles = currentFiles.filter(file => file.url.startsWith('temp/'))
      if (tempFiles.length > 0) deleteFiles(tempFiles).catch(console.error)
    }
  }, []) // Empty deps = cleanup only on unmount

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      // add files individually so a single rejected file doesn't drop the rest
      for (const file of Array.from(files)) {
        try {
          uppy.addFile({ name: file.name, type: file.type, data: file })
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Could not add ${file.name}`)
        }
      }
      if (uppy.getFiles().length === 0) return

      startTransition(async () => {
        try {
          const result = await uppy.upload()
          const uploaded = (result?.successful ?? [])
            .map(uploadedFileToMediaFile)
            .filter((media): media is MediaFile => media !== null)
          if (uploaded.length > 0) {
            append(uploaded)
            clearErrors(fieldName)
          }
          const failedCount = result?.failed?.length ?? 0
          if (failedCount > 0) {
            toast.error(`Failed to upload ${failedCount} file(s). Please retry.`)
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error uploading files')
        } finally {
          // clear so the next batch starts clean (uploaded keys live in the form now)
          uppy.clear()
          setProgress(0)
        }
      })
    },
    [uppy, append, clearErrors, fieldName],
  )

  const handleDeleteFile = useCallback(
    async (index: number) => {
      try {
        const formFiles = (getValues(fieldName) ?? []) as MediaFile[]
        const selectedFile = formFiles.at(index)
        if (!selectedFile) throw new Error('File does not exist')

        // Only delete from storage if it's a new temporary image (not existing)
        if (!existingFiles?.some(existingFile => existingFile.url === selectedFile.url)) {
          await deleteFile(selectedFile)
        }

        remove(index)
        clearErrors(fieldName)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error deleting file')
      }
    },
    [clearErrors, existingFiles, fieldName, remove, getValues],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return
      if (active.id !== over.id) {
        const mediaFiles = (getValues(fieldName) ?? []) as MediaFile[]
        const oldIndex = mediaFiles.findIndex(({ url }) => url === String(active.id))
        const newIndex = mediaFiles.findIndex(({ url }) => url === String(over.id))
        const newOrder = arrayMove(mediaFiles, oldIndex, newIndex)
        setValue(fieldName, newOrder, { shouldDirty: true })
      }
    },
    [fieldName, getValues, setValue],
  )

  return useMemo(
    () => ({
      uploadFiles,
      pending,
      progress,
      handleDeleteFile,
      handleDragEnd,
    }),
    [uploadFiles, pending, progress, handleDeleteFile, handleDragEnd],
  )
}
