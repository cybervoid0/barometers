'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useTransition } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { MovementsDTO } from '@/server/movements/queries'

interface SubcategoryEditProps {
  barometer: NonNullable<BarometerDTO>
  movements: MovementsDTO
}

const NONE_VALUE = '__none__'

const validationSchema = z.object({
  subCategoryId: z.string().nullable().optional(),
})

type SubcategoryForm = z.output<typeof validationSchema>

export function MovementsEdit({ barometer, movements }: SubcategoryEditProps) {
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
  }, [open, form, barometer.subCategoryId])

  const update = (values: SubcategoryForm) => {
    startTransition(async () => {
      try {
        const subCategoryId =
          values.subCategoryId && values.subCategoryId !== NONE_VALUE
            ? Number(values.subCategoryId)
            : null

        // Don't update DB if selected value doesn't differ from the recorded
        if (subCategoryId === barometer.subCategoryId) return setOpen(false)

        const result = await updateBarometer({
          id: barometer.id,
          subCategoryId,
        })
        if (!result.success) throw new Error(result.error)
        setOpen(false)
        toast.success(`Updated movement type in ${result.data.name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton title="Edit movement type" />
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
