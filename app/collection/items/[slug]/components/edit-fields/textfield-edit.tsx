'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { FrontRoutes } from '@/constants/routes-front'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
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
        const { slug, name } = await updateBarometer({
          id: barometer.id,
          [property]: values.value,
        })
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

        <UI.FormProvider {...form}>
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
            <UI.Button type="submit" variant="outline" className="w-full" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </UI.Button>
          </form>
        </UI.FormProvider>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
