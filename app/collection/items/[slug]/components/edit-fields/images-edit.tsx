'use client'

import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { Edit, ImagePlus, Loader2, X } from 'lucide-react'
import { type ComponentProps, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { imageStorage } from '@/constants/globals'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { createImageUrls, deleteImage, deleteImages } from '@/server/images/actions'
import { uploadFileToCloud } from '@/server/images/upload'
import { cn, customImageLoader, getThumbnailBase64 } from '@/utils'

interface ImagesEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
}

const validationSchema = z.object({
  images: z.array(z.string()),
})

type ImagesForm = z.output<typeof validationSchema>

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
        className="text-muted-foreground absolute top-1 right-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
        aria-label="Remove image"
        onClick={() => handleDelete(image)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div {...listeners} className="cursor-move">
        {/* biome-ignore lint/performance/noImgElement: uses custom image loader for optimization */}
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
  const barometerImages = useMemo(() => barometer.images.map(img => img.url), [barometer.images])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ImagesForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open and when barometer images change
  useEffect(() => {
    if (!open) return
    form.reset({ images: barometerImages })
  }, [open, barometerImages, form])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (active.id !== over.id) {
      const currentImages = form.getValues('images')
      const oldIndex = currentImages.indexOf(String(active.id))
      const newIndex = currentImages.indexOf(String(over.id))
      const newOrder = arrayMove(currentImages, oldIndex, newIndex)
      form.setValue('images', newOrder)
    }
  }

  const update = (values: ImagesForm) => {
    startTransition(async () => {
      // exit if no image was changed
      if (isEqual(values.images, barometerImages)) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        return setOpen(false)
      }
      setIsUploading(true)
      try {
        // erase deleted images
        const extraFiles = barometerImages?.filter(img => !values.images.includes(img))
        if (extraFiles) await deleteImages(extraFiles)

        const imageData = await Promise.all(
          values.images.map(async (url, i) => {
            const blurData = await getThumbnailBase64(imageStorage + url)
            return {
              url,
              order: i,
              name: barometer.name,
              blurData,
            }
          }),
        )

        const updatedBarometer = {
          id: barometer.id,
          images: {
            deleteMany: {},
            create: imageData,
          },
        }

        const { name } = await updateBarometer(updatedBarometer)
        setOpen(false)
        toast.success(`Updated images in ${name}.`)
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'editImages: Error updating barometer')
      } finally {
        setIsUploading(false)
      }
    })
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

  // reset form on open and cleanup on close
  // biome-ignore lint/correctness/useExhaustiveDependencies: form not gonna change
  useEffect(() => {
    if (open) {
      form.reset()
    } else {
      // delete unused files from storage when closing
      const cleanup = async () => {
        try {
          setIsUploading(true)
          const currentImages = form.getValues('images')
          const extraImages = currentImages.filter(img => !barometerImages?.includes(img))
          await Promise.all(extraImages.map(deleteImage))
        } catch (_error) {
          // do nothing
        } finally {
          setIsUploading(false)
        }
      }
      cleanup()
    }
  }, [open, barometerImages])

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit images"
          className={cn('absolute top-0 right-20 z-10 h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-4xl">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <div className="relative">
              {isUploading && (
                <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              <UI.DialogHeader>
                <UI.DialogTitle>Edit Images</UI.DialogTitle>
                <UI.DialogDescription>
                  Add, remove, or reorder images for this barometer.
                </UI.DialogDescription>
              </UI.DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-4">
                  <UI.Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isPending}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Add Images
                  </UI.Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <UI.FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <UI.FormItem>
                        <UI.FormLabel>Images</UI.FormLabel>
                        <UI.FormControl>
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
                        </UI.FormControl>
                        <UI.FormMessage />
                      </UI.FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-6">
                <UI.Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isUploading || isPending}
                >
                  Save
                </UI.Button>
              </div>
            </div>
          </form>
        </UI.FormProvider>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
