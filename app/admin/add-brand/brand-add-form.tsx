'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormImageUpload, IconUpload, MultiSelect, RequiredFieldMark } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  Textarea,
} from '@/components/ui'
import { imageStorage } from '@/constants'
import { createBrand } from '@/server/brands/actions'
import type { AllBrandsDTO } from '@/server/brands/queries'
import type { CountryListDTO } from '@/server/counties/queries'
import { createImageUrls } from '@/server/images/actions'
import { uploadFileToCloud } from '@/server/images/upload'
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
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Countries <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <MultiSelect
                  selected={field.value}
                  options={(countries || []).map(({ id, name }) => ({ id, name }))}
                  onChange={field.onChange}
                  placeholder="Select countries"
                  searchPlaceholder="Search countries..."
                  emptyMessage="No countries found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="successors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Successors</FormLabel>
              <FormControl>
                <MultiSelect
                  selected={field.value}
                  options={brands.map(({ id, name }) => ({ id, name }))}
                  onChange={field.onChange}
                  placeholder="Select successor brands"
                  searchPlaceholder="Search brands..."
                  emptyMessage="No brands found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} autoResize />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormImageUpload name="images" />

        <div>
          <FormLabel>Icon</FormLabel>
          <IconUpload onFileChange={handleIconChange} currentIcon={form.watch('icon')} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default BrandAddForm
