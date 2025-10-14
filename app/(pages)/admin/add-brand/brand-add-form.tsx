'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { IconUpload, ImageUpload, MultiSelect, RequiredFieldMark } from '@/components/elements'
import { PdfFilesUpload } from '@/components/elements/pdf-files-upload'
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
import { createBrand } from '@/server/brands/actions'
import type { AllBrandsDTO } from '@/server/brands/queries'
import type { CountryListDTO } from '@/server/counties/queries'
import { generateIcon } from '@/utils'
import { type BrandFormData, brandSchema, brandTransformSchema } from './brand-add-schema'

interface Props {
  countries: CountryListDTO
  brands: AllBrandsDTO
}

function BrandAddForm({ countries, brands }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    mode: 'onChange',
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
      pdfFiles: [],
    },
  })
  const { handleSubmit, setValue, reset, control, watch, formState } = form

  const onSubmit = useCallback(
    (values: BrandFormData) => {
      startTransition(async () => {
        try {
          const result = await createBrand(await brandTransformSchema.parseAsync(values))
          if (!result.success) throw new Error(result.error)
          toast.success(`Brand ${result.data.name} was created`)
          reset()
        } catch (error) {
          console.error('Form submission error:', error)
          toast.error(
            error instanceof Error ? error.message : `Error creating brand ${values.name}.`,
          )
        }
      })
    },
    [reset],
  )

  const handleIconChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        setValue('icon', null, { shouldDirty: true })
        return
      }
      try {
        const fileUrl = URL.createObjectURL(file)
        const iconData = await generateIcon(fileUrl, 50)
        URL.revokeObjectURL(fileUrl)
        setValue('icon', iconData, { shouldDirty: true })
      } catch (error) {
        setValue('icon', null, { shouldDirty: true })
        toast.error(error instanceof Error ? error.message : 'Image cannot be opened')
      }
    },
    [setValue],
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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

        <ImageUpload />

        <div>
          <FormLabel>Icon</FormLabel>
          <IconUpload onFileChange={handleIconChange} currentIcon={watch('icon')} />
        </div>

        <PdfFilesUpload />

        <div className="flex items-center justify-between pt-4">
          <Button type="submit" disabled={isPending || !formState.isValid} className="w-full">
            {isPending ? 'Creating...' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default BrandAddForm
