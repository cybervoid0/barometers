'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import type { AllBarometersDTO } from '@/server/barometers/queries'
import type { ConditionsDTO } from '@/server/conditions/queries'
import { createDocument } from '@/server/documents/actions'
import {
  type DocumentFormData,
  DocumentFormTransformSchema,
  DocumentFormValidationSchema,
} from './document-form.schema'

interface Props {
  conditions: ConditionsDTO
  allBarometers: AllBarometersDTO
}

export function DocumentForm({ conditions, allBarometers }: Props) {
  const methods = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormValidationSchema),
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
        // Transform schema does ALL the heavy lifting - validation AND transformation!
        const result = await createDocument(await DocumentFormTransformSchema.parseAsync(values))
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

        <FormImageUpload />

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
