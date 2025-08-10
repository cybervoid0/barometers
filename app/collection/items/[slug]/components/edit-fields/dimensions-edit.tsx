'use client'

import { isEqual } from 'lodash'
import type { ComponentProps } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO, Dimensions } from '@/app/types'
import { FrontRoutes } from '@/utils/routes-front'
import { updateBarometer } from '@/utils/fetch'
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
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

interface DimensionsForm {
  dimensions: Array<{ dim: string; value: string }>
}

interface DimensionEditProps extends ComponentProps<'button'> {
  barometer: BarometerDTO
}

const validationSchema: yup.ObjectSchema<DimensionsForm> = yup.object({
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
    <Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            dimensions: (barometer.dimensions as Dimensions) || [],
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit dimensions"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateBarometer)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Dimensions</DialogTitle>
              <DialogDescription>Update the dimensions for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Delete parameter"
                      onClick={() => remove(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`dimensions.${index}.dim`}
                      render={({ field: dimField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...dimField} placeholder="Unit (e.g., Height)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`dimensions.${index}.value`}
                      render={({ field: valueField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...valueField} placeholder="Value (e.g., 25cm)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDimension}
                  disabled={fields.length >= 7}
                  className="w-fit"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Parameter
                </Button>
              </div>
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
