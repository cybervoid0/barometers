'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { BarometerDTO } from '@/app/types'
import { updateBarometer } from '@/utils/fetch'
import { FrontRoutes } from '@/utils/routes-front'

interface TextFieldEditProps {
  size?: number
  barometer: BarometerDTO
  property: keyof BarometerDTO
  className?: string
}

interface FormData {
  value: string
}

const textFieldSchema = yup.object().shape({
  value: yup.string().required('Field is required').max(200, 'Must be less than 200 characters'),
})

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
        window.location.href = FrontRoutes.Barometer + slug
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-fit w-fit p-1', className)}>
          <Edit size={size} className="text-destructive" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium capitalize">
            Edit {String(property)}
          </DialogTitle>
          <DialogDescription>
            Update the {String(property)} field for this barometer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="outline" className="w-full" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
