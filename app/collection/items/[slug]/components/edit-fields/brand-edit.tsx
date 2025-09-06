'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
import type { AllBrandsDTO } from '@/lib/brands/queries'

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
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button variant="ghost" aria-label="Change brand" className="h-fit w-fit p-1">
          <Edit className="text-destructive" size={18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-md">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Change Brand</UI.DialogTitle>
              <UI.DialogDescription>
                Update the manufacturer for this barometer.
              </UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Brand</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Select value={field.value} onValueChange={field.onChange}>
                        <UI.SelectTrigger className="w-full">
                          <UI.SelectValue placeholder="Select brand" />
                        </UI.SelectTrigger>
                        <UI.SelectContent side="bottom" className="max-h-[200px]">
                          {brands.map(({ name, id, firstName }) => (
                            <UI.SelectItem key={id} value={id}>
                              {firstName ? `${firstName} ` : ''}
                              {name}
                            </UI.SelectItem>
                          ))}
                        </UI.SelectContent>
                      </UI.Select>
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

export { BrandEdit }
