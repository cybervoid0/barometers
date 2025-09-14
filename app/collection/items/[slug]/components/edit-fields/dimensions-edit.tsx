'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { type ComponentProps, useCallback, useEffect, useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { Dimensions } from '@/types'
import { cn } from '@/utils'

interface DimensionEditProps extends ComponentProps<'button'> {
  barometer: NonNullable<BarometerDTO>
}

const maxDimensions = 7

const validationSchema = z.object({
  dimensions: z
    .array(
      z.object({
        dim: z.string().min(1, 'Unit is required').max(20, 'Dimension name is too long'),
        value: z.string().min(1, 'Value is required').max(20, 'Dimension value is too long'),
      }),
    )
    .max(maxDimensions, 'Too many dimensions'),
})

type DimensionsForm = z.output<typeof validationSchema>

export function DimensionEdit({ barometer, className, ...props }: DimensionEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<DimensionsForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ dimensions: (barometer.dimensions as Dimensions) || [] })
  }, [open, form.reset, barometer.dimensions])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dimensions',
  })

  const handleUpdateBarometer = useCallback(
    (values: DimensionsForm) => {
      startTransition(async () => {
        try {
          // Filter out empty entries
          const filteredDimensions = values.dimensions.filter(({ dim }) => dim.trim())

          if (isEqual(filteredDimensions, barometer.dimensions)) {
            toast.info(`Nothing was updated in ${barometer.name}.`)
            return setOpen(false)
          }

          const { name } = await updateBarometer({
            id: barometer.id,
            dimensions: filteredDimensions,
          })

          setOpen(false)
          toast.success(`Updated dimensions in ${name}.`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error updating barometer')
        }
      })
    },
    [barometer.name, barometer.dimensions, barometer.id],
  )

  const addDimension = () => {
    if (fields.length >= maxDimensions) return
    append({ dim: '', value: '' })
  }

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit dimensions"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-2xl">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateBarometer)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Dimensions</UI.DialogTitle>
              <UI.DialogDescription>Update the dimensions for this barometer.</UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="dimensions"
                render={() => (
                  <UI.FormItem>
                    <UI.FormMessage />
                  </UI.FormItem>
                )}
              />
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <UI.Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Delete parameter"
                      onClick={() => remove(index)}
                      className="shrink-0"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </UI.Button>
                    <UI.FormField
                      control={form.control}
                      name={`dimensions.${index}.dim`}
                      render={({ field: dimField }) => (
                        <UI.FormItem className="flex-1">
                          <UI.FormControl>
                            <UI.Input {...dimField} placeholder="Unit (e.g., Height)" />
                          </UI.FormControl>
                          <UI.FormMessage />
                        </UI.FormItem>
                      )}
                    />
                    <UI.FormField
                      control={form.control}
                      name={`dimensions.${index}.value`}
                      render={({ field: valueField }) => (
                        <UI.FormItem className="flex-1">
                          <UI.FormControl>
                            <UI.Input {...valueField} placeholder="Value (e.g., 25cm)" />
                          </UI.FormControl>
                          <UI.FormMessage />
                        </UI.FormItem>
                      )}
                    />
                  </div>
                ))}
                <div className="flex w-full">
                  <UI.Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDimension}
                    disabled={fields.length >= 7 || isPending}
                    className="w-fit"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Parameter
                  </UI.Button>
                  <div className="grow flex items-center justify-center">
                    {fields.length === 0 && <p className="leading-none">No dimensions</p>}
                  </div>
                </div>
              </div>
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
