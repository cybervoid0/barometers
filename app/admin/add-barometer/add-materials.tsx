'use client'

import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface MaterialsMultiSelectProps {
  value: number[]
  onChange: (value: number[]) => void
  materials: Array<{ id: number; name: string }>
}

export function MaterialsMultiSelect({ value, onChange, materials }: MaterialsMultiSelectProps) {
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
