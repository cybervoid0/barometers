'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useState, useTransition } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EditButton } from '@/components/elements'
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
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'

interface DateEditProps {
  barometer: NonNullable<BarometerDTO>
}

const fromYear = 1600 // barometers barely existed before this year
const currentYear = dayjs().year()

const validationSchema = z.object({
  date: z
    .string()
    .min(1, 'Year is required')
    .length(4, 'Must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Must be a 4-digit year')
    .refine(year => {
      return +year >= fromYear && +year <= currentYear
    }, `Year must be between ${fromYear} and ${currentYear}`),
})

type DateForm = z.output<typeof validationSchema>

export function DateEdit({ barometer }: DateEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<DateForm>({
    resolver: zodResolver(validationSchema),
  })

  const update = (values: DateForm) => {
    startTransition(async () => {
      try {
        if (!form.formState.isDirty) {
          toast.info(`Nothing was updated in ${barometer.name}.`)
          return setOpen(false)
        }
        const result = await updateBarometer({
          id: barometer.id,
          date: dayjs(`${values.date}-01-01`).toISOString(),
        })
        if (!result.success) throw new Error(result.error)
        toast.success(`Updated year in ${result.data.name}.`)
        setOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ date: dayjs(barometer.date).format('YYYY') })
  }, [open, form, barometer.date])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton title="Edit year" />
      <DialogContent className="sm:max-w-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Year</DialogTitle>
              <DialogDescription>Update the year for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="YYYY"
                        maxLength={4}
                        autoFocus
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
            </div>
            <div className="mt-6">
              <Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
