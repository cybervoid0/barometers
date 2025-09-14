'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { cn } from '@/utils'

dayjs.extend(utc)
interface PurchasedAtEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
}

const validationSchema = z.object({
  purchasedAt: z
    .string()
    .min(1, 'Purchase date is required')
    .refine(value => {
      return dayjs(value).isValid()
    }, 'Must be a valid date')
    .refine(value => {
      return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
    }, 'Purchase date cannot be in the future'),
})

type PurchasedAtForm = z.output<typeof validationSchema>

export function PurchasedAtEdit({
  size = 18,
  barometer,
  className,
  ...props
}: PurchasedAtEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<PurchasedAtForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({
      purchasedAt: barometer.purchasedAt
        ? dayjs.utc(barometer.purchasedAt).format('YYYY-MM-DD')
        : '',
    })
  }, [open, barometer.purchasedAt, form.reset])

  const update = (values: PurchasedAtForm) => {
    startTransition(async () => {
      try {
        const currentValue = barometer.purchasedAt
          ? dayjs.utc(barometer.purchasedAt).format('YYYY-MM-DD')
          : ''

        if (values.purchasedAt === currentValue) {
          toast.info(`Nothing was updated in ${barometer.name}.`)
          return setOpen(false)
        }

        const { name } = await updateBarometer({
          id: barometer.id,
          purchasedAt: values.purchasedAt ? dayjs.utc(values.purchasedAt).toISOString() : null,
        })

        setOpen(false)
        toast.success(`Updated purchase date in ${name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  const clearDate = () => {
    form.setValue('purchasedAt', '')
  }

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit purchase date"
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
              <UI.DialogTitle>Edit Purchase Date</UI.DialogTitle>
              <UI.DialogDescription>
                Update the purchase date for this barometer.
              </UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="purchasedAt"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Purchase Date</UI.FormLabel>
                    <UI.FormControl>
                      <div className="flex gap-2">
                        <UI.Input
                          {...field}
                          value={field.value || ''}
                          type="date"
                          placeholder="YYYY-MM-DD"
                          autoFocus
                          className="flex-1"
                        />
                        <UI.Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearDate}
                          disabled={isPending}
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
