'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormImageUpload, MultiSelect, RequiredFieldMark } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { imageStorage } from '@/constants/globals'
import type { AllBarometersDTO } from '@/server/barometers/queries'
import type { ConditionsDTO } from '@/server/conditions/queries'
import { createDocument } from '@/server/documents/actions'
import { getThumbnailBase64 } from '@/utils'

dayjs.extend(utc)

// Zod validation schema
const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  catalogueNumber: z
    .string()
    .min(1, 'Catalogue Number is required')
    .max(100, 'Catalogue Number must be less than 100 characters'),
  documentType: z
    .string()
    .min(1, 'Document Type is required')
    .max(100, 'Document Type must be less than 100 characters'),
  subject: z.string().max(200, 'Subject must be less than 200 characters'),
  creator: z.string().max(200, 'Creator must be less than 200 characters'),
  date: z
    .string()
    .refine(
      value => {
        if (!value) return true // Allow empty string
        return dayjs(value).isValid()
      },
      { message: 'Must be a valid date' },
    )
    .refine(
      value => {
        if (!value) return true
        return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
      },
      { message: 'Date cannot be in the future' },
    ),
  dateDescription: z.string().max(200, 'Date description must be less than 200 characters'),
  placeOfOrigin: z.string().max(200, 'Place of origin must be less than 200 characters'),
  language: z.string().max(100, 'Language must be less than 100 characters'),
  physicalDescription: z.string(),
  annotations: z.string(), // Will be split into array before sending
  provenance: z.string(),
  acquisitionDate: z
    .string()
    .refine(
      value => {
        if (!value) return true // Allow empty string
        return dayjs(value).isValid()
      },
      { message: 'Must be a valid date' },
    )
    .refine(
      value => {
        if (!value) return true
        return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
      },
      { message: 'Acquisition date cannot be in the future' },
    ),
  description: z.string(),
  conditionId: z.string(),
  images: z.array(z.string()),
  relatedBarometers: z.array(z.string()),
})

// Auto-generated TypeScript type from Zod schema
type DocumentFormData = z.infer<typeof documentSchema>

interface Props {
  conditions: ConditionsDTO
  allBarometers: AllBarometersDTO
}

export function DocumentForm({ conditions, allBarometers }: Props) {
  const methods = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
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
      conditionId: conditions.at(-1)?.id ?? '',
      images: [],
      relatedBarometers: [],
    },
  })

  const { handleSubmit, setValue, reset } = methods

  const [isPending, startTransition] = useTransition()

  const submitForm = async (values: DocumentFormData) => {
    startTransition(async () => {
      try {
        const { relatedBarometers, images, ...documentData } = values

        const documentWithImages = {
          ...documentData,
          date: values.date ? dayjs.utc(values.date).toISOString() : null,
          acquisitionDate: values.acquisitionDate
            ? dayjs.utc(values.acquisitionDate).toISOString()
            : null,
          annotations: values.annotations
            ? values.annotations.split('\n').filter(line => line.trim())
            : [],
          images: {
            create: await Promise.all(
              (images || []).map(async (url, i) => ({
                url,
                order: i,
                name: values.title,
                blurData: await getThumbnailBase64(imageStorage + url),
              })),
            ),
          },
          relatedBarometers: {
            connect: relatedBarometers.map((id: string) => ({ id })),
          },
        }

        const result = await createDocument(documentWithImages)
        reset()
        toast.success(`Added document "${result.title}" to the database`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error adding document')
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
        <FormField
          control={methods.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <RequiredFieldMark />
              </FormLabel>
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
              <FormLabel>
                Catalogue Number <RequiredFieldMark />
              </FormLabel>
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
              <FormLabel>
                Document Type <RequiredFieldMark />
              </FormLabel>
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
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">No condition specified</SelectItem>
                    {conditions.map(({ name, id }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormImageUpload name="images" />

        <FormField
          control={methods.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} autoResize placeholder="Enter document description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="relatedBarometers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Barometers</FormLabel>
              <FormControl>
                <MultiSelect
                  selected={field.value || []}
                  onChange={field.onChange}
                  options={allBarometers?.map(b => ({ id: b.id, name: b.name })) ?? []}
                  placeholder="Select barometers..."
                  searchPlaceholder="Search barometers..."
                  emptyMessage="No barometers found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-6 w-full">
          {isPending ? 'Adding...' : 'Add new document'}
        </Button>
      </form>
    </FormProvider>
  )
}
