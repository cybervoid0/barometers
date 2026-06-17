'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { PdfFilesUpload, RequiredFieldMark } from '@/components/elements'
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
import { createEssay } from '@/server/essays/actions'
import {
  ESSAY_TOPICS,
  type EssayFormData,
  EssayFormSchema,
  toEssayActionPayload,
} from './essay-form.schema'

export function EssayForm() {
  const methods = useForm<EssayFormData>({
    mode: 'onChange',
    resolver: zodResolver(EssayFormSchema),
    defaultValues: {
      title: '',
      standfirst: '',
      topic: undefined,
      date: dayjs().format('YYYY-MM-DD'),
      pdfFiles: [],
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isValid },
  } = methods

  const [isPending, startTransition] = useTransition()

  const onSubmit = (values: EssayFormData) => {
    startTransition(async () => {
      try {
        const result = await createEssay(toEssayActionPayload(values))
        reset()
        toast.success(`Added essay "${result.title}"`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error adding essay')
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={methods.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Textarea {...field} autoResize rows={1} placeholder="Enter essay title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="standfirst"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Standfirst <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  autoResize
                  rows={2}
                  placeholder="One-line promise to the reader"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Topic <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESSAY_TOPICS.map(topic => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>
                Date <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PdfFilesUpload
          fieldName="pdfFiles"
          maxFiles={1}
          label="PDF"
          message="Drop the essay PDF here or click to select"
        />

        <Button type="submit" disabled={isPending || !isValid} className="mt-6 w-full">
          {isPending ? 'Adding...' : 'Add new essay'}
        </Button>
      </form>
    </FormProvider>
  )
}
