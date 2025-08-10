'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO } from '@/app/types'
import { useBarometers } from '@/app/hooks/useBarometers'
import { updateBarometer } from '@/utils/fetch'
import { FrontRoutes } from '@/utils/routes-front'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface SubcategoryEditProps extends ComponentProps<'button'> {
  size?: string | number | undefined
  barometer: BarometerDTO
}

interface SubcategoryForm {
  subCategoryId?: string | null
}

const NONE_VALUE = '__none__'

const validationSchema: yup.ObjectSchema<SubcategoryForm> = yup.object({
  subCategoryId: yup.string().nullable().optional(),
})

export function SubcategoryEdit({
  size = 18,
  barometer,
  className,
  ...props
}: SubcategoryEditProps) {
  const { subcategories } = useBarometers()

  const form = useForm<SubcategoryForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      subCategoryId: barometer.subCategoryId ? String(barometer.subCategoryId) : NONE_VALUE,
    },
  })

  const update = async (values: SubcategoryForm) => {
    try {
      const subCategoryId =
        values.subCategoryId && values.subCategoryId !== NONE_VALUE
          ? Number(values.subCategoryId)
          : null

      // Don't update DB if selected value doesn't differ from the recorded
      if (subCategoryId === barometer.subCategoryId) {
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        subCategoryId,
      })

      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  return (
    <Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            subCategoryId: barometer.subCategoryId ? String(barometer.subCategoryId) : NONE_VALUE,
          })
        }
      }}
    >
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
        <Form {...form}>
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
                          {subcategories.data.map(({ name, id }) => (
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
