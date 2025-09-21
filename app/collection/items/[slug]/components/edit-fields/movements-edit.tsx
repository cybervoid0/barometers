'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
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
  FormLabel,
  FormMessage,
  FormProvider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { MovementsDTO } from '@/server/movements/queries'
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit movement type"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Movement Type</DialogTitle>
              <DialogDescription>Update the movement type for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || undefined}
                        onValueChange={value => field.onChange(value === NONE_VALUE ? null : value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pick value" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          {movements.map(({ name, id }) => (
                            <SelectItem key={id} value={String(id)}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
