'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
import { cn } from '@/utils'

interface DateEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
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

export function DateEdit({ size = 18, barometer, className, ...props }: DateEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<DateForm>({
    resolver: zodResolver(validationSchema),
  })

  const update = (values: DateForm) => {
    startTransition(async () => {
      try {
        if (+values.date === dayjs(barometer.date).year()) {
          toast.info(`Nothing was updated in ${barometer.name}.`)
          return setOpen(false)
        }
        const { name } = await updateBarometer({
          id: barometer.id,
          date: dayjs(`${values.date}-01-01`).toISOString(),
        })
        toast.success(`Updated year in ${name}.`)
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
  }, [open, form.reset, barometer.date])

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit year"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-md">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Year</UI.DialogTitle>
              <UI.DialogDescription>Update the year for this barometer.</UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Year</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Input
                        {...field}
                        placeholder="YYYY"
                        maxLength={4}
                        autoFocus
                        onChange={e => {
                          const year = e.target.value.replace(/\D/g, '').slice(0, 4)
                          field.onChange(year)
                        }}
                      />
                    </UI.FormControl>
                    <UI.FormMessage />
                  </UI.FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <UI.Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Save
              </UI.Button>
            </div>
          </form>
        </UI.FormProvider>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
