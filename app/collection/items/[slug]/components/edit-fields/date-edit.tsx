'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { BarometerDTO } from '@/types'
import { updateBarometer } from '@/services/fetch'
import { FrontRoutes } from '@/constants/routes-front'
import { cn } from '@/utils'
import * as UI from '@/components/ui'

interface DateEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const validationSchema = yup.object({
  date: yup
    .string()
    .required('Year is required')
    .matches(/^\d{4}$/, 'Must be a 4-digit year')
    .test('year-range', 'Year must be between 1000 and 2099', value => {
      if (!value) return false
      const year = parseInt(value, 10)
      return year >= 1000 && year <= 2099
    }),
})

type DateForm = yup.InferType<typeof validationSchema>

export function DateEdit({ size = 18, barometer, className, ...props }: DateEditProps) {
  const form = useForm<DateForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      date: dayjs(barometer.date).format('YYYY'),
    },
  })

  const update = async (values: DateForm) => {
    try {
      const { slug } = await updateBarometer({
        id: barometer.id,
        date: dayjs(`${values.date}-01-01`).toISOString(),
      })
      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  return (
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({ date: dayjs(barometer.date).format('YYYY') })
        }
      }}
    >
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
        <UI.Form {...form}>
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
