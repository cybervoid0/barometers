'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { IconUpload, ImageUpload, MultiSelect, RequiredFieldMark } from '@/components/elements'
import * as UI from '@/components/ui'
import { imageStorage } from '@/constants'
import { createBrand } from '@/lib/brands/actions'
import type { AllBrandsDTO } from '@/lib/brands/queries'
import type { CountryListDTO } from '@/lib/counties/queries'
import { createImageUrls, uploadFileToCloud } from '@/services/fetch'
import { generateIcon, getThumbnailBase64 } from '@/utils'

// Zod validation schema
const brandSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().max(100, 'First name should be shorter than 100 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name should be longer than 2 characters')
    .max(100, 'Name should be shorter than 100 characters'),
  city: z.string().max(100, 'City should be shorter than 100 characters'),
  countries: z.array(z.number().int()).min(1, 'At least one country must be selected'),
  url: z.url('URL should be valid internet domain').or(z.literal('')),
  description: z.string(),
  successors: z.array(z.string()),
  images: z.array(z.string()),
  icon: z.string().nullable(),
})

type BrandFormData = z.infer<typeof brandSchema>

interface Props {
  countries: CountryListDTO
  brands: AllBrandsDTO
}

function BrandAddForm({ countries, brands }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      firstName: '',
      name: '',
      city: '',
      url: '',
      countries: [],
      description: '',
      successors: [],
      images: [],
      icon: null,
    },
  })

  const onSubmit = useCallback(
    ({ countries, icon, successors, images, ...values }: BrandFormData) => {
      startTransition(async () => {
        try {
          // Upload images first if any
          let imageData: Array<{ url: string; order: number; name: string; blurData: string }> = []

          if (images.length > 0) {
            // Convert blob URLs to Files
            const files = await Promise.all(
              images.map(async (imageUrl, index) => {
                const response = await fetch(imageUrl)
                const blob = await response.blob()
                const file = new File([blob], `image-${index}.jpg`, { type: blob.type })
                // Clean up blob URL
                URL.revokeObjectURL(imageUrl)
                return file
              }),
            )

            // Get signed URLs for upload
            const urlsDto = await createImageUrls(
              files.map(file => ({
                fileName: file.name,
                contentType: file.type,
              })),
            )

            // Upload files to cloud storage
            await Promise.all(
              urlsDto.urls.map((urlObj, index) => uploadFileToCloud(urlObj.signed, files[index])),
            )

            // Prepare image data for database
            imageData = await Promise.all(
              urlsDto.urls.map(async (url, index) => {
                const blurData = await getThumbnailBase64(imageStorage + url.public)
                return {
                  url: url.public,
                  order: index,
                  name: values.name,
                  blurData,
                }
              }),
            )
          }

          const brandData = {
            ...values,
            countries: {
              connect: countries.map(id => ({ id })),
            },
            successors: {
              connect: successors.map(id => ({ id })),
            },
            ...(imageData.length > 0 && {
              images: {
                create: imageData,
              },
            }),
            icon,
          }

          const { name } = await createBrand(brandData)
          toast.success(`Brand ${name} was created`)
          form.reset()
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : `Error creating brand ${values.name}.`,
          )
        }
      })
    },
    [form],
  )

  const handleIconChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        form.setValue('icon', null, { shouldDirty: true })
        return
      }
      try {
        const fileUrl = URL.createObjectURL(file)
        const iconData = await generateIcon(fileUrl, 50)
        URL.revokeObjectURL(fileUrl)
        form.setValue('icon', iconData, { shouldDirty: true })
      } catch (error) {
        form.setValue('icon', null, { shouldDirty: true })
        toast.error(error instanceof Error ? error.message : 'Image cannot be opened')
      }
    },
    [form],
  )

  return (
    <UI.FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <UI.FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>First name</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>
                Name <RequiredFieldMark />
              </UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="countries"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>
                Countries <RequiredFieldMark />
              </UI.FormLabel>
              <UI.FormControl>
                <MultiSelect
                  selected={field.value}
                  options={(countries || []).map(({ id, name }) => ({ id, name }))}
                  onChange={field.onChange}
                  placeholder="Select countries"
                  searchPlaceholder="Search countries..."
                  emptyMessage="No countries found."
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="successors"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Successors</UI.FormLabel>
              <UI.FormControl>
                <MultiSelect
                  selected={field.value}
                  options={brands.map(({ id, name }) => ({ id, name }))}
                  onChange={field.onChange}
                  placeholder="Select successor brands"
                  searchPlaceholder="Search brands..."
                  emptyMessage="No brands found."
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>City</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Website URL</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="https://example.com" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Description</UI.FormLabel>
              <UI.FormControl>
                <UI.Textarea {...field} rows={3} autoResize />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Images</UI.FormLabel>
              <UI.FormControl>
                <ImageUpload images={field.value} onImagesChange={field.onChange} maxImages={10} />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <div>
          <UI.FormLabel>Icon</UI.FormLabel>
          <IconUpload onFileChange={handleIconChange} currentIcon={form.watch('icon')} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <UI.Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create Brand'}
          </UI.Button>
        </div>
      </form>
    </UI.FormProvider>
  )
}

export default BrandAddForm
