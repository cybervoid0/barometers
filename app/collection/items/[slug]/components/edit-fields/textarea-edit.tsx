'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
import { cn } from '@/utils'

interface TextAreaEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
  property: keyof NonNullable<BarometerDTO>
  label?: string
}

const validationSchema = z.object({
  value: z.string().min(1, 'This field is required'),
})

type TextAreaForm = z.output<typeof validationSchema>

export function TextAreaEdit({
  size = 18,
  barometer,
  property,
  label,
  className,
  ...props
}: TextAreaEditProps) {
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

        const { name } = await updateBarometer({
          id: barometer.id,
          [property]: values.value,
        })

        setOpen(false)
        toast.success(`Updated ${String(property).toLowerCase()} in ${name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  const displayLabel = label || String(property).charAt(0).toUpperCase() + String(property).slice(1)

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label={`Edit ${property}`}
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-2xl">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit {displayLabel}</UI.DialogTitle>
              <UI.DialogDescription>
                Update the {String(property).toLowerCase()} for this barometer.
              </UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>{displayLabel}</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Textarea {...field} autoResize rows={4} autoFocus />
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
