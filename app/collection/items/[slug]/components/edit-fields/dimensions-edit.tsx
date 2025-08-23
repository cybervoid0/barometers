'use client'

import { isEqual } from 'lodash'
import type { ComponentProps } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO, Dimensions } from '@/types'
import { FrontRoutes } from '@/constants/routes-front'
import { updateBarometer } from '@/services/fetch'
import { cn } from '@/utils'
import * as UI from '@/components/ui'

interface DimensionEditProps extends ComponentProps<'button'> {
  barometer: BarometerDTO
}

const validationSchema = yup.object({
  dimensions: yup
    .array()
    .of(
      yup.object({
        dim: yup.string().required('Unit is required'),
        value: yup.string().required('Value is required'),
      }),
    )
    .defined()
    .default([]),
})

type DimensionsForm = yup.InferType<typeof validationSchema>

export function DimensionEdit({ barometer, className, ...props }: DimensionEditProps) {
  const form = useForm<DimensionsForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      dimensions: (barometer.dimensions as Dimensions) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dimensions',
  })

  const handleUpdateBarometer = async (values: DimensionsForm) => {
    try {
      // Filter out empty entries
      const filteredDimensions = values.dimensions.filter(({ dim }) => dim.trim())

      if (isEqual(filteredDimensions, barometer.dimensions)) {
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        dimensions: filteredDimensions,
      })

      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  const addDimension = () => {
    if (fields.length >= 7) return
    append({ dim: '', value: '' })
  }

  return (
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            dimensions: (barometer.dimensions as Dimensions) || [],
          })
        }
      }}
    >
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit dimensions"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-2xl">
        <UI.Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateBarometer)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Dimensions</UI.DialogTitle>
              <UI.DialogDescription>Update the dimensions for this barometer.</UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <UI.Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Delete parameter"
                      onClick={() => remove(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </UI.Button>
                    <UI.FormField
                      control={form.control}
                      name={`dimensions.${index}.dim`}
                      render={({ field: dimField }) => (
                        <UI.FormItem className="flex-1">
                          <UI.FormControl>
                            <UI.Input {...dimField} placeholder="Unit (e.g., Height)" />
                          </UI.FormControl>
                          <UI.FormMessage />
                        </UI.FormItem>
                      )}
                    />
                    <UI.FormField
                      control={form.control}
                      name={`dimensions.${index}.value`}
                      render={({ field: valueField }) => (
                        <UI.FormItem className="flex-1">
                          <UI.FormControl>
                            <UI.Input {...valueField} placeholder="Value (e.g., 25cm)" />
                          </UI.FormControl>
                          <UI.FormMessage />
                        </UI.FormItem>
                      )}
                    />
                  </div>
                ))}
                <UI.Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDimension}
                  disabled={fields.length >= 7}
                  className="w-fit"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Parameter
                </UI.Button>
              </div>
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
