'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { Edit } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as yup from 'yup'
import * as UI from '@/components/ui'
import { FrontRoutes } from '@/constants/routes-front'
import { updateBarometer } from '@/services/fetch'
import { BarometerDTO } from '@/types'
import { cn } from '@/utils'

interface TextFieldEditProps {
  size?: number
  barometer: BarometerDTO
  property: keyof BarometerDTO
  className?: string
}

const textFieldSchema = yup.object().shape({
  value: yup.string().required('Field is required').max(200, 'Must be less than 200 characters'),
})

type FormData = yup.InferType<typeof textFieldSchema>

export function TextFieldEdit({ size = 18, barometer, property, className }: TextFieldEditProps) {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<FormData>({
    resolver: yupResolver(textFieldSchema),
    defaultValues: {
      value: String(barometer[property] || ''),
    },
  })

  const onSubmit = async (values: FormData) => {
    setIsUpdating(true)
    try {
      // Check if value actually changed
      if (values.value === String(barometer[property] || '')) {
        setOpen(false)
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        [property]: values.value,
      })

      toast.success(`${barometer.name} updated`)
      setOpen(false)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button variant="ghost" size="icon" className={cn('h-fit w-fit p-1', className)}>
          <Edit size={size} className="text-destructive" />
        </UI.Button>
      </UI.DialogTrigger>

      <UI.DialogContent className="max-w-md">
        <UI.DialogHeader>
          <UI.DialogTitle className="text-xl font-medium capitalize">
            Edit {String(property)}
          </UI.DialogTitle>
          <UI.DialogDescription>
            Update the {String(property)} field for this barometer.
          </UI.DialogDescription>
        </UI.DialogHeader>

        <UI.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UI.FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormControl>
                    <UI.Input autoFocus {...field} />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />
            <UI.Button type="submit" variant="outline" className="w-full" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </UI.Button>
          </form>
        </UI.Form>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
