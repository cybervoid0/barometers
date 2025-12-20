'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type ComponentProps, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EditButton, ImageUpload } from '@/components/elements'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormProvider,
  LoadingOverlay,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { deleteFiles } from '@/server/files/actions'
import { createImagesInDb } from '@/server/files/images'
import { ImageType } from '@/types'
import { cn } from '@/utils'

interface ImagesEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
}

const ImagesEditSchema = z.object({
  id: z.string(),
  name: z.string(),
  collectionId: z.string(),
  images: z.array(
    z.object({
      url: z.string().min(1, 'Image URL is required'),
      name: z.string(),
    }),
  ),
})
type ImagesForm = z.output<typeof ImagesEditSchema>

const TransformSchema = ImagesEditSchema.transform(
  async ({ images, ...values }): Promise<Parameters<typeof updateBarometer>[0]> => {
    return {
      id: values.id,
      images: {
        deleteMany: {},
        connect: await createImagesInDb(images, ImageType.Barometer, values.collectionId),
      },
    }
  },
)

export function ImagesEdit({ barometer }: ImagesEditProps) {
  const savedImages = useMemo(
    () =>
      barometer.images.map(img => ({
        url: img.url,
        name: img.name ?? '',
      })),
    [barometer.images],
  )
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ImagesForm>({
    resolver: zodResolver(ImagesEditSchema),
  })
  const { reset, handleSubmit } = form

  useEffect(() => {
    if (!open) return
    reset({
      id: barometer.id,
      collectionId: barometer.collectionId,
      images: savedImages,
      name: barometer.name,
    })
  }, [barometer, reset, open, savedImages])

  const update = (values: ImagesForm) => {
    startTransition(async () => {
      // exit if no image was changed
      if (!form.formState.isDirty) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        return setOpen(false)
      }
      try {
        // old images that are no longer in the form - prepare to delete
        const deletedImages = savedImages.filter(
          savedImg => !values.images.some(newImg => newImg.url === savedImg.url),
        )

        const result = await updateBarometer(await TransformSchema.parseAsync(values))
        if (!result.success) throw new Error(result.error)

        setOpen(false)
        toast.success(`Updated images in ${result.data.name}.`)

        if (deletedImages.length > 0) await deleteFiles(deletedImages)
        console.info('Deleted images from storage: ', deletedImages)
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'editImages: Error updating barometer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton label="Edit images" />
      <DialogContent className={cn('sm:max-w-4xl', { 'overflow-hidden': isPending })}>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(update)} noValidate>
            <div className="relative">
              {isPending && <LoadingOverlay />}
              <DialogHeader>
                <DialogTitle>Edit Images</DialogTitle>
                <DialogDescription>
                  Add, remove, or reorder images for this barometer.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <ImageUpload existingImages={savedImages} isDialogOpen={open} />
              </div>
              <div className="mt-6">
                <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
                  Save
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
