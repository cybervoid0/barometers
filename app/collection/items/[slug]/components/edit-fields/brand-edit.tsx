'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState, useTransition } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { AllBrandsDTO } from '@/server/brands/queries'
import { EditButton } from './edit-button'

interface Props {
  barometer: NonNullable<BarometerDTO>
  brands: AllBrandsDTO
}

const validationSchema = z.object({
  brandId: z.string().min(1, 'Brand is required'),
})

type BrandForm = z.output<typeof validationSchema>

function BrandEdit({ brands, barometer }: Props) {
  const [open, setOpen] = useState(false)
  const closeDialog = () => setOpen(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<BrandForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ brandId: barometer.manufacturerId })
  }, [open, barometer.manufacturerId, form.reset])

  // biome-ignore lint/correctness/useExhaustiveDependencies: exclude closeDialog
  const update = useCallback(
    (values: BrandForm) => {
      if (values.brandId === barometer.manufacturerId) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        return closeDialog()
      }
      startTransition(async () => {
        try {
          const { name } = await updateBarometer({
            id: barometer.id,
            manufacturerId: values.brandId,
          })
          setOpen(false)
          toast.success(`Updated brand in ${name}.`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error updating barometer brand')
        }
      })
    },
    [barometer.manufacturerId, barometer.name],
  )
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton />
      <DialogContent className="sm:max-w-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <DialogHeader>
              <DialogTitle>Change Brand</DialogTitle>
              <DialogDescription>Update the manufacturer for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent side="bottom" className="max-h-[200px]">
                          {brands.map(({ name, id, firstName }) => (
                            <SelectItem key={id} value={id}>
                              {firstName ? `${firstName} ` : ''}
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

export { BrandEdit }
