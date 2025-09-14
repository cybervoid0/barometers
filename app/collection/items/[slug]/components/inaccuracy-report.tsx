'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useTransition } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import type { BarometerDTO } from '@/lib/barometers/queries'
import { createReport } from '@/lib/reports/actions'

interface Props extends React.ComponentProps<'button'> {
  barometer: NonNullable<BarometerDTO>
}

const maxFeedbackLen = 1000

const validationSchema = z.object({
  reporterName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  reporterEmail: z.email('Please enter a valid email address').min(1, 'Email is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(maxFeedbackLen, `Description must be less than ${maxFeedbackLen} characters`),
})

type ReportForm = z.infer<typeof validationSchema>

export function InaccuracyReport({ barometer, ...props }: Props) {
  const [isOpened, setIsOpened] = React.useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ReportForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: { reporterName: '', reporterEmail: '', description: '' },
  })

  const onSubmit = form.handleSubmit(values => {
    startTransition(async () => {
      try {
        const result = await createReport({ ...values, barometerId: barometer.id })
        setIsOpened(false)
        form.reset()
        toast.success(
          `Thank you! Your report was registered with ID ${result.id}. We will contact you at the provided email`,
        )
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to submit report')
      }
    })
  })

  const descriptionValue = form.watch('description') ?? ''
  const symbolsLeft = maxFeedbackLen - descriptionValue.length

  useEffect(() => {
    if (!isOpened) return
    form.reset()
  }, [form.reset, isOpened])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...props}
            type="button"
            variant="outline"
            onClick={() => setIsOpened(true)}
            aria-label={`Open report inaccuracy dialog for ${barometer.name}`}
          >
            <span className="text-sm font-normal tracking-wider uppercase">Report inaccuracy</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Report issues in the description of
          <span className="ml-1 capitalize">{barometer.name}</span>
        </TooltipContent>
      </Tooltip>
      <Dialog open={isOpened} onOpenChange={setIsOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report inaccuracy</DialogTitle>
            <DialogDescription>
              Found an error in the description of {barometer.name}? Let us know.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <FormField
                control={form.control}
                name="reporterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
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
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the inaccuracy"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-muted-foreground text-xs">
                      {descriptionValue.length > 0 && descriptionValue.length <= maxFeedbackLen
                        ? `${symbolsLeft} symbol${symbolsLeft === 1 ? '' : 's'} remaining`
                        : descriptionValue.length > maxFeedbackLen
                          ? `Feedback is ${-symbolsLeft} character${-symbolsLeft === 1 ? '' : 's'} longer than allowed`
                          : null}
                    </p>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isPending}>
                  Send
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  )
}
