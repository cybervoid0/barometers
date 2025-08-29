'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as yup from 'yup'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { imageStorage } from '@/constants/globals'
import { useBarometers } from '@/hooks/useBarometers'
import { createBarometer } from '@/services/fetch'
import { getThumbnailBase64, slug } from '@/utils'
import { AddManufacturer } from './add-manufacturer'
import { MaterialsMultiSelect } from './add-materials'
import { Dimensions } from './dimensions'
import { FileUpload } from './file-upload'

dayjs.extend(utc)

// Yup validation schema
const barometerSchema = yup.object().shape({
  collectionId: yup
    .string()
    .required('Catalogue No. is required')
    .max(100, 'Catalogue No. must be less than 100 characters'),
  name: yup
    .string()
    .required('Title is required')
    .max(200, 'Title must be less than 200 characters'),
  categoryId: yup.string().required('Category is required'),
  date: yup
    .string()
    .required('Year is required')
    .matches(/^\d{4}$/, 'Year must be 4 digits'),
  dateDescription: yup.string().required('Date description is required'),
  manufacturerId: yup.string().required('Manufacturer is required'),
  conditionId: yup.string().required('Condition is required'),
  description: yup.string().default(''),
  dimensions: yup
    .array()
    .of(
      yup.object().shape({
        dim: yup.string().default(''),
        value: yup.string().default(''),
      }),
    )
    .default([]),
  images: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one image is required')
    .default([]),
  purchasedAt: yup
    .string()
    .test('valid-date', 'Must be a valid date', value => {
      if (!value) return true // Allow empty string
      return dayjs(value).isValid()
    })
    .test('not-future', 'Purchase date cannot be in the future', value => {
      if (!value) return true
      return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
    })
    .default(''),
  serial: yup.string().max(100, 'Serial number must be less than 100 characters').default(''),
  estimatedPrice: yup
    .string()
    .test('is-positive-number', 'Must be a positive number', value => {
      if (!value) return true // Allow empty string
      const num = parseFloat(value)
      return !Number.isNaN(num) && num > 0
    })
    .default(''),
  subCategoryId: yup.string().default(''),
  materials: yup.array().of(yup.number().required()).default([]),
})

// Auto-generated TypeScript type from Yup schema
type BarometerFormData = yup.InferType<typeof barometerSchema>

export default function AddCard() {
  const { condition, categories, subcategories, manufacturers, materials } = useBarometers()

  const methods = useForm<BarometerFormData>({
    resolver: yupResolver(barometerSchema),
    defaultValues: {
      collectionId: '',
      name: '',
      categoryId: '',
      date: '1900',
      dateDescription: '',
      manufacturerId: '',
      conditionId: '',
      description: '',
      dimensions: [],
      images: [],
      purchasedAt: '',
      serial: '',
      estimatedPrice: '',
      subCategoryId: 'none',
      materials: [],
    },
  })

  const { handleSubmit, setValue, reset } = methods

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: BarometerFormData) => {
      const barometerWithImages = {
        ...values,
        date: dayjs(`${values.date}-01-01`).toISOString(),
        purchasedAt: values.purchasedAt ? dayjs.utc(values.purchasedAt).toISOString() : null,
        estimatedPrice: values.estimatedPrice ? parseFloat(values.estimatedPrice) : null,
        ...(values.subCategoryId &&
          values.subCategoryId !== 'none' && { subCategoryId: parseInt(values.subCategoryId, 10) }),
        images: await Promise.all(
          (values.images || []).map(async (url, i) => ({
            url,
            order: i,
            name: values.name,
            blurData: await getThumbnailBase64(imageStorage + url),
          })),
        ),
        slug: slug(values.name),
      }
      return createBarometer(barometerWithImages)
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({
        queryKey: ['barometers'],
      })
      reset()
      toast.success(`Added ${id} to the database`)
    },
    onError: error => {
      toast.error(error.message || 'Error adding barometer')
    },
  })

  // Set default values when data loads
  useEffect(() => {
    if (categories.data.length > 0) {
      setValue('categoryId', String(categories.data[0].id))
    }
  }, [categories.data, setValue])

  useEffect(() => {
    if (condition.data.length > 0) {
      setValue('conditionId', String(condition.data.at(-1)?.id))
    }
  }, [condition.data, setValue])

  useEffect(() => {
    if (manufacturers.data.length > 0) {
      setValue('manufacturerId', String(manufacturers.data[0].id))
    }
  }, [manufacturers.data, setValue])

  const handleAddManufacturer = (id: string) => {
    setValue('manufacturerId', id)
  }

  const onSubmit = (data: BarometerFormData) => {
    mutate(data)
  }

  return (
    <div className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new barometer</h3>

      <FormProvider {...methods}>
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField
              control={methods.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catalogue No. *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter AWIF catalogue #" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter serial number" maxLength={100} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter barometer name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      maxLength={4}
                      onChange={e => {
                        const year = e.target.value.replace(/\D/g, '').slice(0, 4)
                        field.onChange(year)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="dateDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date description *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter date description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="purchasedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="date"
                        placeholder="YYYY-MM-DD"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setValue('purchasedAt', '')}
                        className="shrink-0"
                      >
                        Clear
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="estimatedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Price, €</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="100"
                      min="0"
                      placeholder="Enter estimated price in Euro"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials</FormLabel>
                  <FormControl>
                    <MaterialsMultiSelect
                      value={field.value}
                      onChange={field.onChange}
                      materials={materials.data ?? []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={
                      field.value ||
                      (categories.data.length > 0 ? String(categories.data[0].id) : '')
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {categories.data.map(({ name, id }) => (
                        <SelectItem key={id} value={String(id)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="subCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movement Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select movement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      <SelectItem value="none">No type</SelectItem>
                      {subcategories.data.map(({ name, id }) => (
                        <SelectItem key={id} value={String(id)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="manufacturerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer *</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={field.onChange}
                      value={
                        field.value ||
                        (manufacturers.data.length > 0 ? String(manufacturers.data[0].id) : '')
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {manufacturers.data.map(({ name, id }) => (
                          <SelectItem key={id} value={String(id)}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <AddManufacturer onAddManufacturer={handleAddManufacturer} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="conditionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={
                      field.value ||
                      (condition.data.length > 0 ? String(condition.data.at(-1)?.id) : '')
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {condition.data.map(({ name, id }) => (
                        <SelectItem key={id} value={String(id)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FileUpload name="images" />

            <Dimensions />

            <FormField
              control={methods.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      autoResize
                      placeholder="Enter barometer description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="outline" disabled={isPending} className="mt-6">
              {isPending ? 'Adding...' : 'Add new barometer'}
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
