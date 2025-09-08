'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as yup from 'yup'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
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
import { createDocument } from '@/lib/documents/actions'
import { getThumbnailBase64 } from '@/utils'
import { FileUpload } from '../add-barometer/file-upload'

dayjs.extend(utc)

// Yup validation schema
const documentSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(200, 'Title must be less than 200 characters'),
  catalogueNumber: yup
    .string()
    .required('Catalogue Number is required')
    .max(100, 'Catalogue Number must be less than 100 characters'),
  documentType: yup
    .string()
    .required('Document Type is required')
    .max(100, 'Document Type must be less than 100 characters'),
  subject: yup.string().max(200, 'Subject must be less than 200 characters').default(''),
  creator: yup.string().max(200, 'Creator must be less than 200 characters').default(''),
  date: yup
    .string()
    .test('valid-date', 'Must be a valid date', value => {
      if (!value) return true // Allow empty string
      return dayjs(value).isValid()
    })
    .test('not-future', 'Date cannot be in the future', value => {
      if (!value) return true
      return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
    })
    .default(''),
  dateDescription: yup
    .string()
    .max(200, 'Date description must be less than 200 characters')
    .default(''),
  placeOfOrigin: yup
    .string()
    .max(200, 'Place of origin must be less than 200 characters')
    .default(''),
  language: yup.string().max(100, 'Language must be less than 100 characters').default(''),
  physicalDescription: yup.string().default(''),
  annotations: yup.string().default(''), // Will be split into array before sending
  provenance: yup.string().default(''),
  acquisitionDate: yup
    .string()
    .test('valid-date', 'Must be a valid date', value => {
      if (!value) return true // Allow empty string
      return dayjs(value).isValid()
    })
    .test('not-future', 'Acquisition date cannot be in the future', value => {
      if (!value) return true
      return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
    })
    .default(''),
  description: yup.string().default(''),
  conditionId: yup.string().default(''),
  images: yup.array().of(yup.string().required()).default([]),
  relatedBarometers: yup.array().of(yup.string().required()).default([]),
})

// Auto-generated TypeScript type from Yup schema
type DocumentFormData = yup.InferType<typeof documentSchema>

export default function AddDocument() {
  const { condition } = useBarometers()

  const methods = useForm<DocumentFormData>({
    resolver: yupResolver(documentSchema),
    defaultValues: {
      title: '',
      catalogueNumber: '',
      documentType: '',
      subject: '',
      creator: '',
      date: '',
      dateDescription: '',
      placeOfOrigin: '',
      language: '',
      physicalDescription: '',
      annotations: '',
      provenance: '',
      acquisitionDate: '',
      description: '',
      conditionId: '',
      images: [],
      relatedBarometers: [],
    },
  })

  const { handleSubmit, setValue, reset } = methods

  const [isPending, startTransition] = useTransition()

  const submitForm = async (values: DocumentFormData) => {
    startTransition(async () => {
      try {
        const documentWithImages = {
          ...values,
          date: values.date ? dayjs.utc(values.date).toISOString() : null,
          acquisitionDate: values.acquisitionDate
            ? dayjs.utc(values.acquisitionDate).toISOString()
            : null,
          conditionId: values.conditionId || null,
          annotations: values.annotations
            ? values.annotations.split('\n').filter(line => line.trim())
            : [],
          images: await Promise.all(
            (values.images || []).map(async (url, i) => ({
              url,
              order: i,
              name: values.title,
              blurData: await getThumbnailBase64(imageStorage + url),
            })),
          ),
        }

        const result = await createDocument(documentWithImages)

        if (result.success) {
          reset()
          toast.success(`Added document ${result.id} to the database`)
        } else {
          toast.error(result.error || 'Error adding document')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error adding document')
      }
    })
  }

  // Set default condition when data loads
  useEffect(() => {
    if (condition.data.length > 0) {
      setValue('conditionId', String(condition.data.at(-1)?.id))
    }
  }, [condition.data, setValue])

  return (
    <div className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new document</h3>

      <FormProvider {...methods}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
            <FormField
              control={methods.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter document title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="catalogueNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catalogue Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter catalogue number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Manual, Patent, Advertisement" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter document subject" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="creator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator/Author</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter creator or author name" />
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
                  <FormLabel>Date</FormLabel>
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
                        onClick={() => setValue('date', '')}
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
              name="dateDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. c.1870, mid 19th century" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="placeOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Origin</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter place of origin" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. English, German, French" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="physicalDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      autoResize
                      placeholder="Describe physical characteristics, dimensions, materials, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="annotations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annotations</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      autoResize
                      placeholder="Enter inscriptions, stamps, etc. (one per line)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="provenance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provenance</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      autoResize
                      placeholder="Enter history of ownership and origin"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="acquisitionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acquisition Date</FormLabel>
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
                        onClick={() => setValue('acquisitionDate', '')}
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
              name="conditionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(value === 'none' ? '' : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      <SelectItem value="none">No condition specified</SelectItem>
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
                      placeholder="Enter document description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="outline" disabled={isPending} className="mt-6">
              {isPending ? 'Adding...' : 'Add new document'}
            </Button>
          </form>
        </FormProvider>
      </FormProvider>
    </div>
  )
}
