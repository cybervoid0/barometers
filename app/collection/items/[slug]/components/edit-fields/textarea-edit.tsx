'use client'

import { isEqual } from 'lodash'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO } from '@/app/types'
import { FrontRoutes } from '@/utils/routes-front'
import { updateBarometer } from '@/utils/fetch'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface TextAreaForm {
  value: string
}

interface TextAreaEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
  property: keyof BarometerDTO
  label?: string
}

const validationSchema: yup.ObjectSchema<TextAreaForm> = yup.object({
  value: yup.string().required('This field is required'),
})

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
    <Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            value: String(barometer[property] || ''),
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label={`Edit ${property}`}
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
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
