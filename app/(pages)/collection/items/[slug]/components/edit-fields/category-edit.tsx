'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DialogDescription } from '@radix-ui/react-dialog'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { CategoriesDTO } from '@/server/categories/queries'
import { EditButton } from './edit-button'

interface Props {
  barometer: NonNullable<BarometerDTO>
  categories: CategoriesDTO
}

const Schema = z.object({
  categoryId: z.string().min(1, 'Select the category'),
})

type Form = z.infer<typeof Schema>

export function CategoryEdit({ barometer, categories }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<Form>({
    resolver: zodResolver(Schema),
    defaultValues: {
      categoryId: barometer.categoryId,
    },
  })

  const update = useCallback(
    ({ categoryId }: Form) => {
      if (!form.formState.isDirty) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        return setOpen(false)
      }
      startTransition(async () => {
        try {
          const result = await updateBarometer({
            id: barometer.id,
            categoryId,
          })
          if (!result.success) throw new Error(result.error)
          setOpen(false)
          toast.success(`Changed category in ${result.data.name}.`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error updating barometer condition')
        }
      })
    },
    [barometer, form.formState.isDirty],
  )
  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ categoryId: barometer.categoryId })
  }, [open, barometer.categoryId, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton />
      <DialogContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the category for {barometer.name}.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(({ id, label }) => (
                            <SelectItem key={id} value={id}>
                              {label}
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
