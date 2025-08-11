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
import * as UI from '@/components/ui'

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
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            subCategoryId: barometer.subCategoryId ? String(barometer.subCategoryId) : NONE_VALUE,
          })
        }
      }}
    >
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
        <UI.Form {...form}>
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
                          {subcategories.data.map(({ name, id }) => (
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
              <UI.Button type="submit" variant="outline" className="w-full">
                Save
              </UI.Button>
            </div>
          </form>
        </UI.Form>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
