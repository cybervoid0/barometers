'use client'

import { Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { imageStorage } from '@/constants/globals'
import { createImageUrls, deleteImage, uploadFileToCloud } from '@/services/fetch'

interface FileUploadProps {
  name: string
}

export function FileUpload({ name }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { control, watch, setValue, clearErrors } = useFormContext()

  const fileNames: string[] = watch(name) || []

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

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
      clearErrors(name) // Clear any validation errors after successful upload
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
      // Clear errors if we still have images after deletion
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
          <FormLabel>Images</FormLabel>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleFileSelect}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex flex-wrap gap-2">
                {fileNames.map((fileName, i) => (
                  <Card key={fileName} className="relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => handleDeleteFile(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <img
                      src={imageStorage + fileName}
                      alt={`Upload ${i + 1}`}
                      className="h-12 w-12 rounded object-contain p-1"
                    />
                  </Card>
                ))}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => uploadImages(e.target.files)}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
