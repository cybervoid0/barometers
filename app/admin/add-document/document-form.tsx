'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { MultiSelect, RequiredFieldMark } from '@/components/elements'
import * as UI from '@/components/ui'
import { imageStorage } from '@/constants/globals'
import type { AllBarometersDTO } from '@/lib/barometers/queries'
import type { ConditionsDTO } from '@/lib/conditions/queries'
import { createDocument } from '@/lib/documents/actions'
import { getThumbnailBase64 } from '@/utils'
import { FileUpload } from '../add-barometer/file-upload'

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
    <UI.FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
        <UI.FormField
          control={methods.control}
          name="title"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>
                Title <RequiredFieldMark />
              </UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="Enter document title" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="catalogueNumber"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>
                Catalogue Number <RequiredFieldMark />
              </UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="Enter catalogue number" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="documentType"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>
                Document Type <RequiredFieldMark />
              </UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="e.g. Manual, Patent, Advertisement" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="subject"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Subject</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="Enter document subject" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="creator"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Creator/Author</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="Enter creator or author name" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="date"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Date</UI.FormLabel>
              <UI.FormControl>
                <div className="flex gap-2">
                  <UI.Input
                    {...field}
                    value={field.value || ''}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    className="flex-1"
                  />
                  <UI.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('date', '')}
                    className="shrink-0"
                  >
                    Clear
                  </UI.Button>
                </div>
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="dateDescription"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Date Description</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="e.g. c.1870, mid 19th century" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="placeOfOrigin"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Place of Origin</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="Enter place of origin" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="language"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Language</UI.FormLabel>
              <UI.FormControl>
                <UI.Input {...field} placeholder="e.g. English, German, French" />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="physicalDescription"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Physical Description</UI.FormLabel>
              <UI.FormControl>
                <UI.Textarea
                  {...field}
                  rows={3}
                  autoResize
                  placeholder="Describe physical characteristics, dimensions, materials, etc."
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="annotations"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Annotations</UI.FormLabel>
              <UI.FormControl>
                <UI.Textarea
                  {...field}
                  rows={3}
                  autoResize
                  placeholder="Enter inscriptions, stamps, etc. (one per line)"
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="provenance"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Provenance</UI.FormLabel>
              <UI.FormControl>
                <UI.Textarea
                  {...field}
                  rows={3}
                  autoResize
                  placeholder="Enter history of ownership and origin"
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="acquisitionDate"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Acquisition Date</UI.FormLabel>
              <UI.FormControl>
                <div className="flex gap-2">
                  <UI.Input
                    {...field}
                    value={field.value || ''}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    className="flex-1"
                  />
                  <UI.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('acquisitionDate', '')}
                    className="shrink-0"
                  >
                    Clear
                  </UI.Button>
                </div>
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="conditionId"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Condition</UI.FormLabel>
              <UI.FormControl>
                <UI.Select onValueChange={field.onChange} value={field.value}>
                  <UI.SelectTrigger className="w-full">
                    <UI.SelectValue placeholder="Select condition" />
                  </UI.SelectTrigger>
                  <UI.SelectContent className="max-h-60">
                    <UI.SelectItem value="none">No condition specified</UI.SelectItem>
                    {conditions.map(({ name, id }) => (
                      <UI.SelectItem key={id} value={id}>
                        {name}
                      </UI.SelectItem>
                    ))}
                  </UI.SelectContent>
                </UI.Select>
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <FileUpload name="images" />

        <UI.FormField
          control={methods.control}
          name="description"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Description</UI.FormLabel>
              <UI.FormControl>
                <UI.Textarea
                  {...field}
                  rows={3}
                  autoResize
                  placeholder="Enter document description"
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.FormField
          control={methods.control}
          name="relatedBarometers"
          render={({ field }) => (
            <UI.FormItem>
              <UI.FormLabel>Related Barometers</UI.FormLabel>
              <UI.FormControl>
                <MultiSelect
                  selected={field.value || []}
                  onChange={field.onChange}
                  options={allBarometers?.map(b => ({ id: b.id, name: b.name })) ?? []}
                  placeholder="Select barometers..."
                  searchPlaceholder="Search barometers..."
                  emptyMessage="No barometers found."
                />
              </UI.FormControl>
              <UI.FormMessage />
            </UI.FormItem>
          )}
        />

        <UI.Button type="submit" disabled={isPending} className="mt-6 w-full">
          {isPending ? 'Adding...' : 'Add new document'}
        </UI.Button>
      </form>
    </UI.FormProvider>
  )
}
