'use client'

import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dayjs from 'dayjs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useBarometers } from '@/hooks/useBarometers'
import { FileUpload } from './file-upload'
import { AddManufacturer } from './add-manufacturer'
import { Dimensions } from './dimensions'

import { createBarometer } from '@/services/fetch'
import { getThumbnailBase64, slug } from '@/utils'
import { imageStorage } from '@/constants/globals'

// Form data interface
interface BarometerFormData {
  collectionId: string
  name: string
  categoryId: string
  date: string
  dateDescription: string
  manufacturerId: string
  conditionId: string
  description: string
  dimensions: Array<{ dim: string; value: string }>
  images: string[]
}

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
})

export default function AddCard() {
  const { condition, categories, manufacturers } = useBarometers()

  const methods = useForm<BarometerFormData>({
    resolver: yupResolver(barometerSchema),
    defaultValues: {
      collectionId: '',
      name: '',
      categoryId: '',
      date: '',
      dateDescription: '',
      manufacturerId: '',
      conditionId: '',
      description: '',
      dimensions: [],
      images: [],
    },
  })

  const { handleSubmit, setValue, watch, reset } = methods

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: BarometerFormData) => {
      const barometerWithImages = {
        ...values,
        date: dayjs(`${values.date}-01-01`).toISOString(),
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
    if (manufacturers.data.length > 0 && !watch('manufacturerId')) {
      setValue('manufacturerId', String(manufacturers.data[0].id))
    }
  }, [manufacturers.data, setValue, watch])

  const handleAddManufacturer = (id: string) => {
    setValue('manufacturerId', id)
  }

  const onSubmit = (data: BarometerFormData) => {
    mutate(data)
  }

  return (
    <div className="mx-auto max-w-lg">
      <h3 className="mt-6">Add new barometer</h3>

      <FormProvider {...methods}>
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={methods.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catalogue No. *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} id="barometer-name" />
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
                      placeholder="YYYY"
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
                    <Input {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="manufacturerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer *</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    <Textarea {...field} rows={3} autoResize />
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
