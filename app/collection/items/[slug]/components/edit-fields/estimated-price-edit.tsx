'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
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

interface EstimatedPriceEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

interface EstimatedPriceForm {
  estimatedPrice: string
}

const validationSchema: yup.ObjectSchema<EstimatedPriceForm> = yup.object({
  estimatedPrice: yup
    .string()
    .required('Price is required')
    .test('is-decimal', 'Must be a valid decimal number', value => {
      if (!value) return false
      return /^\d+(\.\d{1,2})?$/.test(value)
    }),
})

export function EstimatedPriceEdit({
  size = 18,
  barometer,
  className,
  ...props
}: EstimatedPriceEditProps) {
  const form = useForm<EstimatedPriceForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      estimatedPrice: barometer.estimatedPrice ? String(barometer.estimatedPrice) : '',
    },
  })

  const update = async (values: EstimatedPriceForm) => {
    try {
      const newEstimatedPrice = Number(values.estimatedPrice)

      // Don't update if value hasn't changed
      if (newEstimatedPrice === barometer.estimatedPrice) {
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        estimatedPrice: newEstimatedPrice,
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
          form.reset({
            estimatedPrice: barometer.estimatedPrice ? String(barometer.estimatedPrice) : '',
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit estimated price"
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
              <DialogTitle>Edit Estimated Price</DialogTitle>
              <DialogDescription>Update the estimated price for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="estimatedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                        <Input {...field} className="pl-8" placeholder="0.00" autoFocus />
                      </div>
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
