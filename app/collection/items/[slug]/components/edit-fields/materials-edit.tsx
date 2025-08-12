'use client'

import { isEqual } from 'lodash'
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO } from '@/types'
import { FrontRoutes } from '@/constants/routes-front'
import { updateBarometer } from '@/services/fetch'
import { useBarometers } from '@/hooks/useBarometers'
import { cn } from '@/utils'
import * as UI from '@/components/ui'

interface MaterialsForm {
  materials: number[]
}

interface MaterialsEditProps extends ComponentProps<'button'> {
  barometer: BarometerDTO
}

const validationSchema: yup.ObjectSchema<MaterialsForm> = yup.object({
  materials: yup.array().of(yup.number().required()).defined().default([]),
})

export function MaterialsEdit({ barometer, className, ...props }: MaterialsEditProps) {
  const { materials: materialList } = useBarometers()

  const form = useForm<MaterialsForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      materials: barometer.materials.map(({ id }) => id),
    },
  })

  const handleUpdateBarometer = async (values: MaterialsForm) => {
    try {
      if (
        isEqual(
          values.materials,
          barometer.materials.map(({ id }) => id),
        )
      ) {
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        materials: values.materials,
      })

      toast.success(`${barometer.name} updated`)
      setTimeout(() => {
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  const materialsData = useMemo(() => materialList.data ?? [], [materialList])

  return (
    <UI.Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            materials: barometer.materials.map(({ id }) => id),
          })
        }
      }}
    >
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit materials"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-md">
        <UI.Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateBarometer)} noValidate>
            <UI.DialogHeader>
              <UI.DialogTitle>Edit Materials</UI.DialogTitle>
              <UI.DialogDescription>Update the materials for this barometer.</UI.DialogDescription>
            </UI.DialogHeader>
            <div className="mt-4 space-y-4">
              <UI.FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>Materials</UI.FormLabel>
                    <UI.FormControl>
                      <MaterialsMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        materials={materialsData}
                      />
                    </UI.FormControl>
                    <UI.FormMessage />
                  </UI.FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <UI.Button type="submit" variant="outline" className="w-full">
                Update
              </UI.Button>
            </div>
          </form>
        </UI.Form>
      </UI.DialogContent>
    </UI.Dialog>
  )
}

interface MaterialsMultiSelectProps {
  value: number[]
  onChange: (value: number[]) => void
  materials: Array<{ id: number; name: string }>
}

function MaterialsMultiSelect({ value, onChange, materials }: MaterialsMultiSelectProps) {
  const selectedMaterials = materials.filter(material => value.includes(material.id))

  const handleSelect = (materialId: number) => {
    if (value.includes(materialId)) {
      onChange(value.filter(id => id !== materialId))
    } else {
      onChange([...value, materialId])
    }
  }

  const handleRemove = (materialId: number) => {
    onChange(value.filter(id => id !== materialId))
  }

  return (
    <div className="space-y-2">
      {selectedMaterials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMaterials.map(material => (
            <UI.Badge key={material.id} variant="default" className="px-2 py-1">
              {material.name}
              <UI.Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(material.id)}
              >
                <X className="h-3 w-3" />
              </UI.Button>
            </UI.Badge>
          ))}
        </div>
      )}
      <UI.Popover modal>
        <UI.PopoverTrigger asChild>
          <UI.Button type="button" variant="outline" className="w-full justify-start">
            {selectedMaterials.length === 0
              ? 'Select materials...'
              : `${selectedMaterials.length} material${selectedMaterials.length === 1 ? '' : 's'} selected`}
          </UI.Button>
        </UI.PopoverTrigger>
        <UI.PopoverContent className="w-full p-0" align="start">
          <UI.Command>
            <UI.CommandInput placeholder="Search materials..." />
            <UI.CommandList className="max-h-[200px]">
              <UI.CommandEmpty>No materials found.</UI.CommandEmpty>
              <UI.CommandGroup>
                {materials.map(material => (
                  <UI.CommandItem
                    key={material.id}
                    onSelect={() => handleSelect(material.id)}
                    className="flex items-center space-x-2"
                  >
                    <div className="flex h-4 w-4 items-center justify-center">
                      {value.includes(material.id) && <Check className="h-3 w-3" />}
                    </div>
                    <span>{material.name}</span>
                  </UI.CommandItem>
                ))}
              </UI.CommandGroup>
            </UI.CommandList>
          </UI.Command>
        </UI.PopoverContent>
      </UI.Popover>
    </div>
  )
}
