'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { Check, X } from 'lucide-react'
import { type ComponentProps, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { EditButton } from '@/components/elements'
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { MaterialsDTO } from '@/server/materials/queries'

interface MaterialsEditProps extends ComponentProps<'button'> {
  barometer: NonNullable<BarometerDTO>
  materials: MaterialsDTO
}

const validationSchema = z.object({
  materials: z.array(z.number()),
})

type MaterialsForm = z.output<typeof validationSchema>

export function MaterialsEdit({ barometer, materials }: MaterialsEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<MaterialsForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ materials: barometer.materials.map(({ id }) => id) })
  }, [open, form, barometer.materials])

  const handleUpdateBarometer = (values: MaterialsForm) => {
    startTransition(async () => {
      try {
        if (
          isEqual(
            values.materials,
            barometer.materials.map(({ id }) => id),
          )
        ) {
          toast.info(`Nothing was updated in ${barometer.name}.`)
          return setOpen(false)
        }

        const result = await updateBarometer({
          id: barometer.id,
          materials: {
            set: values.materials.map(id => ({ id })),
          },
        })
        if (!result.success) throw new Error(result.error)
        setOpen(false)
        toast.success(`Updated materials in ${result.data.name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating barometer')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton title="Edit materials" />
      <DialogContent className="sm:max-w-md">
        <FormProvider {...form}>
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
                        materials={materials}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Update
              </Button>
            </div>
          </form>
        </FormProvider>
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
