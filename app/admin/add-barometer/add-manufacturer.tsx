'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import * as UI from '@/components/ui'
import { addManufacturer } from '@/services/fetch'
import { useBarometers } from '@/hooks/useBarometers'
import { generateIcon } from '@/utils'

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
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.Tooltip>
        <UI.TooltipTrigger asChild>
          <UI.DialogTrigger asChild>
            <UI.Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </UI.Button>
          </UI.DialogTrigger>
        </UI.TooltipTrigger>
        <UI.TooltipContent>
          <p>Add manufacturer</p>
        </UI.TooltipContent>
      </UI.Tooltip>

      <UI.DialogContent className="max-w-md">
        <UI.DialogHeader>
          <UI.DialogTitle>Add Manufacturer</UI.DialogTitle>
        </UI.DialogHeader>

        <UI.Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <UI.FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>First name</UI.FormLabel>
                  <UI.FormControl>
                    <UI.Input {...field} />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <UI.FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Name *</UI.FormLabel>
                  <UI.FormControl>
                    <UI.Input {...field} id="manufacturer-name" />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <CountryMultiSelect
              countries={countries.data || []}
              selectedCountries={watch('countries')}
              onCountriesChange={selected => setValue('countries', selected)}
            />

            <UI.FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>City</UI.FormLabel>
                  <UI.FormControl>
                    <UI.Input {...field} />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <UI.FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Description</UI.FormLabel>
                  <UI.FormControl>
                    <UI.Textarea {...field} rows={2} autoResize />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <div className="flex items-end justify-between">
              <UI.Button type="submit" variant="outline" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Manufacturer'}
              </UI.Button>
              <IconUpload onFileChange={handleIconChange} />
            </div>
          </form>
        </UI.Form>
      </UI.DialogContent>
    </UI.Dialog>
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
      <UI.Label>Countries</UI.Label>
      <UI.Popover open={open} onOpenChange={setOpen}>
        <UI.PopoverTrigger asChild>
          <UI.Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCountries.length > 0
              ? `${selectedCountries.length} countries selected`
              : 'Select countries'}
          </UI.Button>
        </UI.PopoverTrigger>
        <UI.PopoverContent className="w-full p-0">
          <UI.Command>
            <UI.CommandInput placeholder="Search countries..." />
            <UI.CommandEmpty>No country found.</UI.CommandEmpty>
            <UI.CommandGroup className="max-h-60 overflow-auto">
              {countries.map(country => (
                <UI.CommandItem
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
                </UI.CommandItem>
              ))}
            </UI.CommandGroup>
          </UI.Command>
        </UI.PopoverContent>
      </UI.Popover>

      {selectedCountryNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCountryNames.map(name => (
            <UI.Badge key={name} variant="secondary" className="text-xs">
              {name}
              <UI.Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => {
                  const country = countries.find(c => c.name === name)
                  if (country) handleSelect(country.id)
                }}
              >
                <X className="h-3 w-3" />
              </UI.Button>
            </UI.Badge>
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
          <UI.Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={() => handleFileSelect(null)}
            aria-label="Remove icon"
          >
            <X className="h-3 w-3" />
          </UI.Button>
          <img
            src={previewUrl}
            alt="Icon preview"
            className="h-12 w-12 rounded border object-cover"
          />
        </div>
      )}

      <UI.Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Select Icon
      </UI.Button>

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
