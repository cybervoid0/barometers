'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { Plus, Trash2 } from 'lucide-react'
import { type ComponentProps, useCallback, useEffect, useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EditButton } from '@/components/elements'
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
  FormMessage,
  FormProvider,
  Input,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { Dimensions } from '@/types'

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

export function DimensionEdit({ barometer }: DimensionEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<DimensionsForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ dimensions: (barometer.dimensions as Dimensions) || [] })
  }, [open, form, barometer.dimensions])

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

          const result = await updateBarometer({
            id: barometer.id,
            dimensions: filteredDimensions,
          })
          if (!result.success) throw new Error(result.error)

          setOpen(false)
          toast.success(`Updated dimensions in ${result.data.name}.`)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton title="Edit dimensions" />
      <DialogContent className="sm:max-w-2xl">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateBarometer)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Dimensions</DialogTitle>
              <DialogDescription>Update the dimensions for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="dimensions"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Delete parameter"
                      onClick={() => remove(index)}
                      className="shrink-0"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`dimensions.${index}.dim`}
                      render={({ field: dimField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...dimField} placeholder="Unit (e.g., Height)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`dimensions.${index}.value`}
                      render={({ field: valueField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...valueField} placeholder="Value (e.g., 25cm)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <div className="flex w-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDimension}
                    disabled={fields.length >= 7 || isPending}
                    className="w-fit"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Parameter
                  </Button>
                  <div className="grow flex items-center justify-center">
                    {fields.length === 0 && <p className="leading-none">No dimensions</p>}
                  </div>
                </div>
              </div>
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
