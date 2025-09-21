'use client'

import { X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'

interface MultiSelectProps<T extends string | number> {
  selected: T[]
  options: { id: T; name: string }[]
  onChange: (values: T[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function MultiSelect<T extends string | number>({
  selected,
  options,
  onChange,
  placeholder = 'Select items',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found.',
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false)

  const selectedItems = useMemo(
    () => options.filter(item => selected.includes(item.id)),
    [options, selected],
  )

  const handleSelect = useCallback(
    (itemId: T) => {
      if (selected.includes(itemId)) {
        onChange(selected.filter(id => id !== itemId))
      } else {
        onChange([...selected, itemId])
      }
    },
    [onChange, selected],
  )

  const handleRemove = useCallback(
    (itemId: T) => {
      onChange(selected.filter(id => id !== itemId))
    },
    [onChange, selected],
  )

  return (
    <div className="space-y-2">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map(item => (
            <Badge key={item.id} variant="default" className="px-2 py-1">
              {item.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            {selected.length === 0 ? placeholder : `${selected.length} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-[200px]">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map(opt => {
                  const isActive = selected.includes(opt.id)
                  return (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => handleSelect(opt.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {isActive && <div className="h-2 w-2 bg-current rounded-full" />}
                      </div>
                      {opt.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
