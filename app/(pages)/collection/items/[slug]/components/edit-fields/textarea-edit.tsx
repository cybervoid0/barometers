'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
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
  FormLabel,
  FormMessage,
  FormProvider,
  Textarea,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'

interface TextAreaEditProps extends ComponentProps<'button'> {
  barometer: NonNullable<BarometerDTO>
  property: keyof NonNullable<BarometerDTO>
  label?: string
}

const validationSchema = z.object({
  value: z.string().min(1, 'This field is required'),
})

type TextAreaForm = z.output<typeof validationSchema>

export function TextAreaEdit({ barometer, property, label }: TextAreaEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<TextAreaForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open with current data
  useEffect(() => {
    if (!open) return
    form.reset({
      value: String(barometer[property] || ''),
    })
  }, [open, barometer, property, form])

  const handleUpdate = (values: TextAreaForm) => {
    startTransition(async () => {
      try {
        if (isEqual(values.value, barometer[property])) {
          toast.info(`Nothing was updated in ${barometer.name}.`)
          return setOpen(false)
        }

        const result = await updateBarometer({
          id: barometer.id,
          [property]: values.value,
        })
        if (!result.success) throw new Error(result.error)
        setOpen(false)
        toast.success(`Updated ${String(property).toLowerCase()} in ${result.data.name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  const displayLabel = label || String(property).charAt(0).toUpperCase() + String(property).slice(1)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton title={`Edit ${property}`} />
      <DialogContent className="sm:max-w-2xl">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit {displayLabel}</DialogTitle>
              <DialogDescription>
                Update the {String(property).toLowerCase()} for this barometer.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{displayLabel}</FormLabel>
                    <FormControl>
                      <Textarea {...field} autoResize rows={4} autoFocus />
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
