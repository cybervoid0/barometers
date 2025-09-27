'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormProvider,
  Input,
} from '@/components/ui'
import { FrontRoutes } from '@/constants/routes-front'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import { cn } from '@/utils'

interface TextFieldEditProps {
  size?: number
  barometer: NonNullable<BarometerDTO>
  property: keyof NonNullable<BarometerDTO>
  className?: string
}

const textFieldSchema = z.object({
  value: z.string().min(1, 'Field is required').max(200, 'Must be less than 200 characters'),
})

type FormData = z.infer<typeof textFieldSchema>

export function TextFieldEdit({ size = 18, barometer, property, className }: TextFieldEditProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(textFieldSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ value: String(barometer[property] || '') })
  }, [open, form.reset, barometer[property], property])

  const onSubmit = (values: FormData) => {
    // Check if value actually changed
    if (values.value === String(barometer[property] || '')) {
      toast.info(`Nothing was updated in ${barometer.name}.`)
      return setOpen(false)
    }
    startTransition(async () => {
      try {
        const result = await updateBarometer({
          id: barometer.id,
          [property]: values.value,
        })
        if (!result.success) throw new Error(result.error)
        const { slug, name } = result.data
        // reload the page if property was 'name' or 'slug' and the page URL has changed
        if (property === 'name' || property === 'slug') {
          router.replace(FrontRoutes.Barometer + slug)
        }
        toast.success(`${name} updated`)
        setOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Edit field"
          variant="ghost"
          size="icon"
          className={cn('h-fit w-fit p-1', className)}
        >
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

        <FormProvider {...form}>
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
            <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
