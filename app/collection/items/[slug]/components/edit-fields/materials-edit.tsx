'use client'

import { isEqual } from 'lodash'
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { BarometerDTO } from '@/app/types'
import { FrontRoutes } from '@/utils/routes-front'
import { updateBarometer } from '@/utils/fetch'
import { useBarometers } from '@/app/hooks/useBarometers'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

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
    <Dialog
      onOpenChange={isOpen => {
        if (isOpen) {
          form.reset({
            materials: barometer.materials.map(({ id }) => id),
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Edit materials"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateBarometer)} noValidate>
            <DialogHeader>
              <DialogTitle>Edit Materials</DialogTitle>
              <DialogDescription>Update the materials for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials</FormLabel>
                    <FormControl>
                      <MaterialsMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        materials={materialsData}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <Button type="submit" variant="outline" className="w-full">
                Update
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
            <Badge key={material.id} variant="default" className="px-2 py-1">
              {material.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(material.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Popover modal>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start">
            {selectedMaterials.length === 0
              ? 'Select materials...'
              : `${selectedMaterials.length} material${selectedMaterials.length === 1 ? '' : 's'} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search materials..." />
            <CommandList className="max-h-[200px]">
              <CommandEmpty>No materials found.</CommandEmpty>
              <CommandGroup>
                {materials.map(material => (
                  <CommandItem
                    key={material.id}
                    onSelect={() => handleSelect(material.id)}
                    className="flex items-center space-x-2"
                  >
                    <div className="flex h-4 w-4 items-center justify-center">
                      {value.includes(material.id) && <Check className="h-3 w-3" />}
                    </div>
                    <span>{material.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
