'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { cn } from '@/utils'

interface EstimatedPriceEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
}

const validationSchema = z.object({
  estimatedPrice: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal number'),
})

type EstimatedPriceForm = z.output<typeof validationSchema>

export function EstimatedPriceEdit({
  size = 18,
  barometer,
  className,
  ...props
}: EstimatedPriceEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<EstimatedPriceForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ estimatedPrice: barometer.estimatedPrice ? String(barometer.estimatedPrice) : '' })
  }, [open, form.reset, barometer.estimatedPrice])

  const update = (values: EstimatedPriceForm) => {
    startTransition(async () => {
      try {
        const newEstimatedPrice = Number(values.estimatedPrice)

        // Don't update if value hasn't changed
        if (newEstimatedPrice === barometer.estimatedPrice) {
          toast.info(`Nothing was updated in ${barometer.name}`)
          return setOpen(false)
        }

        const result = await updateBarometer({
          id: barometer.id,
          estimatedPrice: newEstimatedPrice,
        })
        if (!result.success) throw new Error(result.error)
        setOpen(false)
        toast.success(`Updated estimated price in ${result.data.name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <FormProvider {...form}>
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
                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
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
