'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { BarometerDTO } from '@/types'
import { updateBarometer } from '@/services/fetch'
import { FrontRoutes } from '@/constants/routes-front'
import { cn } from '@/utils'
import * as UI from '@/components/ui'

dayjs.extend(utc)
interface PurchasedAtEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const validationSchema = yup.object({
  purchasedAt: yup
    .string()
    .test('valid-date', 'Must be a valid date', value => {
      if (!value) return true // Allow empty string
      return dayjs(value).isValid()
    })
    .test('not-future', 'Purchase date cannot be in the future', value => {
      if (!value) return true
      return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
    })
    .defined(),
})

type PurchasedAtForm = yup.InferType<typeof validationSchema>

export function PurchasedAtEdit({
  size = 18,
  barometer,
  className,
  ...props
}: PurchasedAtEditProps) {
  const form = useForm<PurchasedAtForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      purchasedAt: barometer.purchasedAt
        ? dayjs.utc(barometer.purchasedAt).format('YYYY-MM-DD')
        : '',
    },
  })

  const update = async (values: PurchasedAtForm) => {
    try {
      const { slug } = await updateBarometer({
        id: barometer.id,
        purchasedAt: values.purchasedAt ? dayjs.utc(values.purchasedAt).toISOString() : null,
      })
      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  const clearDate = () => {
    form.setValue('purchasedAt', '')
  }

  return (
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            purchasedAt: barometer.purchasedAt
              ? dayjs.utc(barometer.purchasedAt).format('YYYY-MM-DD')
              : '',
          })
        }
      }}
    >
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
        <UI.Form {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Purchase Date</UI.DialogTitle>
              <UI.DialogDescription>
                Update the purchase date for this barometer. Leave empty if unknown.
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
              <UI.Button type="submit" variant="outline" className="w-full">
                Save
              </UI.Button>
            </div>
          </form>
        </UI.Form>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
