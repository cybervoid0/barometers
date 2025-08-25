'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { isEqual } from 'lodash'
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

interface TextAreaEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
  property: keyof BarometerDTO
  label?: string
}

const validationSchema = yup.object({
  value: yup.string().required('This field is required'),
})

type TextAreaForm = yup.InferType<typeof validationSchema>

export function TextAreaEdit({
  size = 18,
  barometer,
  property,
  label,
  className,
  ...props
}: TextAreaEditProps) {
  const form = useForm<TextAreaForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      value: String(barometer[property] || ''),
    },
  })

  const handleUpdate = async (values: TextAreaForm) => {
    try {
      if (isEqual(values.value, barometer[property])) {
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        [property]: values.value,
      })

      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  const displayLabel = label || String(property).charAt(0).toUpperCase() + String(property).slice(1)

  return (
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            value: String(barometer[property] || ''),
          })
        }
      }}
    >
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
        <UI.Form {...form}>
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
