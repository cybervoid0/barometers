'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
import type { MovementsDTO } from '@/lib/movements/queries'
import { cn } from '@/utils'

interface SubcategoryEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: NonNullable<BarometerDTO>
  movements: MovementsDTO
}

const NONE_VALUE = '__none__'

const validationSchema = z.object({
  subCategoryId: z.string().nullable().optional(),
})

type SubcategoryForm = z.output<typeof validationSchema>

export function MovementsEdit({
  size = 18,
  barometer,
  movements,
  className,
  ...props
}: SubcategoryEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<SubcategoryForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({
      subCategoryId: barometer.subCategoryId ? String(barometer.subCategoryId) : NONE_VALUE,
    })
  }, [open, form.reset, barometer.subCategoryId])

  const update = (values: SubcategoryForm) => {
    startTransition(async () => {
      try {
        const subCategoryId =
          values.subCategoryId && values.subCategoryId !== NONE_VALUE
            ? Number(values.subCategoryId)
            : null

        // Don't update DB if selected value doesn't differ from the recorded
        if (subCategoryId === barometer.subCategoryId) return setOpen(false)

        const { name } = await updateBarometer({
          id: barometer.id,
          subCategoryId,
        })

        setOpen(false)
        toast.success(`Updated movement type in ${name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit movement type"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-md">
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Movement Type</UI.DialogTitle>
              <UI.DialogDescription>
                Update the movement type for this barometer.
              </UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Movement Type</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Select
                        value={field.value || undefined}
                        onValueChange={value => field.onChange(value === NONE_VALUE ? null : value)}
                      >
                        <UI.SelectTrigger className="w-full">
                          <UI.SelectValue placeholder="Pick value" />
                        </UI.SelectTrigger>
                        <UI.SelectContent className="max-h-[300px]">
                          <UI.SelectItem value={NONE_VALUE}>None</UI.SelectItem>
                          {movements.map(({ name, id }) => (
                            <UI.SelectItem key={id} value={String(id)}>
                              {name}
                            </UI.SelectItem>
                          ))}
                        </UI.SelectContent>
                      </UI.Select>
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
