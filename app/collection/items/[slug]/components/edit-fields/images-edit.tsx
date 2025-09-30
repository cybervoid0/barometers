'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormImageUpload } from '@/components/elements'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormProvider,
  LoadingOverlay,
} from '@/components/ui'
import { imageStorage } from '@/constants/globals'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { deleteImages, saveTempImage } from '@/server/images/actions'
import { ImageType } from '@/types'
import { cn, getThumbnailBase64 } from '@/utils'

interface ImagesEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
}

const ImagesEditSchema = z.object({
  id: z.string(),
  name: z.string(),
  collectionId: z.string(),
  images: z.array(z.string()),
})
type ImagesForm = z.output<typeof ImagesEditSchema>

const TransformSchema = ImagesEditSchema.transform(
  async ({ images, ...values }): Promise<Parameters<typeof updateBarometer>[0]> => {
    return {
      id: values.id,
      images: {
        deleteMany: {},
        create: await Promise.all(
          images.map(async (url, i) => {
            const imageUrl = url.startsWith('temp/')
              ? await saveTempImage(url, ImageType.Barometer, values.collectionId)
              : url
            const blurData = await getThumbnailBase64(imageStorage + imageUrl)
            return {
              url: imageUrl,
              order: i,
              name: values.name,
              blurData,
            }
          }),
        ),
      },
    }
  },
)

export function ImagesEdit({ barometer, size, className, ...props }: ImagesEditProps) {
  const images = useMemo(() => barometer.images.map(img => img.url), [barometer.images])
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
      images,
      name: barometer.name,
    })
  }, [barometer, reset, open, images])

  const update = (values: ImagesForm) => {
    startTransition(async () => {
      // exit if no image was changed
      if (!form.formState.isDirty) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        return setOpen(false)
      }
      try {
        const result = await updateBarometer(await TransformSchema.parseAsync(values))
        if (!result.success) throw new Error(result.error)
        const { name } = result.data
        // erase deleted images
        const extraFiles = images?.filter(img => !values.images.includes(img))
        if (extraFiles) await deleteImages(extraFiles)
        setOpen(false)
        toast.success(`Updated images in ${name}.`)
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'editImages: Error updating barometer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit images"
          className={cn('absolute top-0 right-20 z-10 h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </Button>
      </DialogTrigger>
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
                <FormImageUpload existingImages={images} isDialogOpen={open} />
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
