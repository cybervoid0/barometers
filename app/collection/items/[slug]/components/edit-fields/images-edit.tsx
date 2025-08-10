'use client'

import { isEqual } from 'lodash'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit, ImagePlus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  useSortable,
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMemo, useState, useRef } from 'react'
import { BarometerDTO } from '@/app/types'
import { imageStorage } from '@/utils/constants'
import { FrontRoutes } from '@/utils/routes-front'
import { createImageUrls, deleteImage, updateBarometer, uploadFileToCloud } from '@/utils/fetch'
import { getThumbnailBase64 } from '@/utils/misc'
import customImageLoader from '@/utils/image-loader'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface ImagesForm {
  images: string[]
}

interface ImagesEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const validationSchema: yup.ObjectSchema<ImagesForm> = yup.object({
  images: yup.array().of(yup.string().required()).defined().default([]),
})

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
      ref={setNodeRef}
      className="relative"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
      <button
        type="button"
        className="absolute right-1 top-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-muted-foreground shadow"
        aria-label="Remove image"
        onClick={() => handleDelete(image)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div {...listeners} className="cursor-move">
        <img
          src={customImageLoader({ src: image, quality: 85, width: 100 })}
          alt="Barometer"
          className="min-h-[100px] w-[100px] rounded border object-contain"
        />
      </div>
    </div>
  )
}
export function ImagesEdit({ barometer, size, className, ...props }: ImagesEditProps) {
  const barometerImages = useMemo(() => barometer.images.map(img => img.url), [barometer])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ImagesForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      images: barometerImages,
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (active.id !== over.id) {
      const currentImages = form.getValues('images')
      const oldIndex = currentImages.findIndex(image => image === active.id)
      const newIndex = currentImages.findIndex(image => image === over.id)
      const newOrder = arrayMove(currentImages, oldIndex, newIndex)
      form.setValue('images', newOrder)
    }
  }

  const update = async (values: ImagesForm) => {
    // exit if no image was changed
    if (isEqual(values.images, barometerImages)) {
      return
    }
    setIsUploading(true)
    try {
      // erase deleted images
      const extraFiles = barometerImages?.filter(img => !values.images.includes(img))
      if (extraFiles)
        await Promise.all(
          extraFiles?.map(async file => {
            try {
              await deleteImage(file)
            } catch (error) {
              // don't mind if it was not possible to delete the file
            }
          }),
        )

      const updatedBarometer = {
        id: barometer.id,
        images: await Promise.all(
          values.images.map(async (url, i) => {
            const blurData = await getThumbnailBase64(imageStorage + url)
            return {
              url,
              order: i,
              name: barometer.name,
              blurData,
            }
          }),
        ),
      }

      const { slug } = await updateBarometer(updatedBarometer)
      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'editImages: Error updating barometer')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Upload images to storage
   */
  const uploadImages = async (files: File[]) => {
    if (!files || !Array.isArray(files) || files.length === 0) return
    setIsUploading(true)
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
      const currentImages = form.getValues('images')
      form.setValue('images', [...currentImages, ...newImages])
    } catch (error) {
      const defaultErrMsg = 'Error uploading files'
      toast.error(error instanceof Error ? error.message : defaultErrMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (img: string) => {
    setIsUploading(true)
    try {
      // if the image file was uploaded but not yet added to the barometer
      if (!barometerImages?.includes(img)) await deleteImage(img)
      const currentImages = form.getValues('images')
      form.setValue(
        'images',
        currentImages.filter(file => !file.includes(img)),
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      uploadImages(Array.from(files))
    }
  }

  const onClose = async () => {
    // delete unused files from storage
    try {
      setIsUploading(true)
      const currentImages = form.getValues('images')
      const extraImages = currentImages.filter(img => !barometerImages?.includes(img))
      await Promise.all(extraImages.map(deleteImage))
    } catch (error) {
      // do nothing
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog
      onOpenChange={async isOpen => {
        if (isOpen) {
          form.reset({ images: barometerImages })
        } else {
          await onClose()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit images"
          className={cn('absolute right-20 top-0 z-10 h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <div className="relative">
              {isUploading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              <DialogHeader>
                <DialogTitle>Edit Images</DialogTitle>
                <DialogDescription>
                  Add, remove, or reorder images for this barometer.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Add Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext
                              items={field.value}
                              strategy={horizontalListSortingStrategy}
                            >
                              <div className="flex flex-wrap gap-4">
                                {field.value.map(img => (
                                  <SortableImage
                                    key={img}
                                    image={img}
                                    handleDelete={handleDeleteFile}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button type="submit" variant="outline" className="w-full" disabled={isUploading}>
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
