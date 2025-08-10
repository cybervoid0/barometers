'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { BarometerDTO } from '@/app/types'
import { updateBarometer } from '@/utils/fetch'
import { FrontRoutes } from '@/utils/routes-front'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface DateEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

interface DateForm {
  date: string
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
    <Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({ date: dayjs(barometer.date).format('YYYY') })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit year"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
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
              <Button type="submit" variant="outline" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
