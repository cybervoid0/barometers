'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { Edit } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as yup from 'yup'
import * as UI from '@/components/ui'
import { FrontRoutes } from '@/constants/routes-front'
import { updateBarometer } from '@/services/fetch'
import { BarometerDTO } from '@/types'
import { cn } from '@/utils'

interface EstimatedPriceEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const validationSchema = yup.object({
  estimatedPrice: yup
    .string()
    .required('Price is required')
    .test('is-decimal', 'Must be a valid decimal number', value => {
      if (!value) return false
      return /^\d+(\.\d{1,2})?$/.test(value)
    }),
})

type EstimatedPriceForm = yup.InferType<typeof validationSchema>

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
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            estimatedPrice: barometer.estimatedPrice ? String(barometer.estimatedPrice) : '',
          })
        }
      }}
    >
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit estimated price"
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
              <UI.DialogTitle>Edit Estimated Price</UI.DialogTitle>
              <UI.DialogDescription>
                Update the estimated price for this barometer.
              </UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="estimatedPrice"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Estimated Price</UI.FormLabel>
                    <UI.FormControl>
                      <div className="relative">
                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                          €
                        </span>
                        <UI.Input {...field} className="pl-8" placeholder="0.00" autoFocus />
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
