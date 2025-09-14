'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { imageStorage } from '@/constants/globals'
import { createImageUrls, deleteImage } from '@/server/images/actions'
import { uploadFileToCloud } from '@/server/images/upload'
import { DragImages } from './drag-images'

interface FormImageUploadProps {
  name: string
  label?: string
  maxImages?: number
}

export function FormImageUpload({ name, label = 'Images', maxImages = 10 }: FormImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { control, watch, setValue, clearErrors } = useFormContext()

  const fileNames: string[] = watch(name) || []

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    setIsUploading(true)

    try {
      const urlsDto = await createImageUrls(
        filesArray.map(file => ({
          fileName: file.name,
          contentType: file.type,
        })),
      )

      await Promise.all(
        urlsDto.urls.map((urlObj, index) => uploadFileToCloud(urlObj.signed, filesArray[index])),
      )

      const newFileNames = [...fileNames, ...urlsDto.urls.map(urlObj => urlObj.public)]
      setValue(name, newFileNames)
      clearErrors(name)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error uploading files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (index: number) => {
    const fileName = fileNames.at(index)
    if (!fileName) return

    try {
      await deleteImage(fileName)
      const updatedFileNames = fileNames.filter((_, i) => i !== index)
      setValue(name, updatedFileNames)
      if (updatedFileNames.length > 0) {
        clearErrors(name)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting file')
    }
  }

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <DragImages
                onFileSelect={uploadImages}
                disabled={isUploading}
                currentCount={fileNames.length}
                maxImages={maxImages}
              />

              {fileNames.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {fileNames.map((fileName, i) => (
                    <div key={fileName} className="relative">
                      <div className="aspect-square">
                        <Image
                          unoptimized
                          alt={`Upload ${i + 1}`}
                          src={imageStorage + fileName}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full"
                        onClick={() => handleDeleteFile(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
