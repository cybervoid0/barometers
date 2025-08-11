'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { addManufacturer } from '@/utils/fetch'
import { useBarometers } from '@/app/hooks/useBarometers'
import { generateIcon } from '@/utils/misc'

interface AddManufacturerProps {
  onAddManufacturer: (newId: string) => void
}

interface ManufacturerFormData {
  firstName: string
  name: string
  city: string
  countries: number[]
  description: string
  icon: string | null
}

// Yup validation schema
const manufacturerSchema = yup.object().shape({
  firstName: yup.string().max(100, 'First name should be shorter than 100 characters').default(''),
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be longer than 2 characters')
    .max(100, 'Name should be shorter than 100 characters'),
  city: yup.string().max(100, 'City should be shorter than 100 characters').default(''),
  countries: yup.array().of(yup.number().required()).default([]),
  description: yup.string().default(''),
  icon: yup.string().nullable().default(null),
})

export function AddManufacturer({ onAddManufacturer }: AddManufacturerProps) {
  const { countries } = useBarometers()
  const [open, setOpen] = useState(false)

  const form = useForm<ManufacturerFormData>({
    resolver: yupResolver(manufacturerSchema),
    defaultValues: {
      firstName: '',
      name: '',
      city: '',
      countries: [],
      description: '',
      icon: null,
    },
  })

  const { handleSubmit, setValue, reset, watch } = form

  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: addManufacturer,
    onSuccess: ({ id }, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['manufacturers'],
      })
      reset()
      onAddManufacturer(id)
      setOpen(false)
      toast.success(`${variables.name} has been recorded as a manufacturer #${id ?? 0}`)
    },
    onError: error => {
      toast.error(error.message || 'Error adding manufacturer')
    },
  })

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const handleIconChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        setValue('icon', null)
        return
      }
      try {
        const fileUrl = URL.createObjectURL(file)
        const iconData = await generateIcon(fileUrl, 50)
        URL.revokeObjectURL(fileUrl)
        setValue('icon', iconData)
      } catch (error) {
        setValue('icon', null)
        toast.error(error instanceof Error ? error.message : 'Image cannot be opened')
      }
    },
    [setValue],
  )

  const onSubmit = (values: ManufacturerFormData) => {
    mutate({
      ...values,
      countries: values.countries.map(id => ({ id })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add manufacturer</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manufacturer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} id="manufacturer-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CountryMultiSelect
              countries={countries.data || []}
              selectedCountries={watch('countries')}
              onCountriesChange={selected => setValue('countries', selected)}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} autoResize />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end justify-between">
              <Button type="submit" variant="outline" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Manufacturer'}
              </Button>
              <IconUpload onFileChange={handleIconChange} />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Country Multi-Select Component
interface Country {
  id: number
  name: string
}

interface CountryMultiSelectProps {
  countries: Country[]
  selectedCountries: number[]
  onCountriesChange: (selected: number[]) => void
}

function CountryMultiSelect({
  countries,
  selectedCountries,
  onCountriesChange,
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (countryId: number) => {
    const newSelected = selectedCountries.includes(countryId)
      ? selectedCountries.filter(id => id !== countryId)
      : [...selectedCountries, countryId]
    onCountriesChange(newSelected)
  }

  const selectedCountryNames = countries
    .filter(country => selectedCountries.includes(country.id))
    .map(country => country.name)

  return (
    <div className="space-y-2">
      <Label>Countries</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCountries.length > 0
              ? `${selectedCountries.length} countries selected`
              : 'Select countries'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {countries.map(country => (
                <CommandItem
                  key={country.id}
                  value={country.name}
                  onSelect={() => handleSelect(country.id)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country.id)}
                      onChange={() => handleSelect(country.id)}
                      className="h-4 w-4"
                    />
                    <span>{country.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCountryNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCountryNames.map(name => (
            <Badge key={name} variant="secondary" className="text-xs">
              {name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => {
                  const country = countries.find(c => c.name === name)
                  if (country) handleSelect(country.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface IconUploadProps {
  onFileChange: (file: File | null) => void
}

const IconUpload = ({ onFileChange }: IconUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File | null) => {
    onFileChange(selectedFile)

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    handleFileSelect(file)
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="flex flex-col items-end gap-2">
      {previewUrl && (
        <div className="relative w-fit">
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={() => handleFileSelect(null)}
            aria-label="Remove icon"
          >
            <X className="h-3 w-3" />
          </Button>
          <img
            src={previewUrl}
            alt="Icon preview"
            className="h-12 w-12 rounded border object-cover"
          />
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Select Icon
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
