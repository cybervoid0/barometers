'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { BarometerDTO } from '@/app/types'
import { FrontRoutes } from '@/utils/routes-front'
import { useBarometers } from '@/app/hooks/useBarometers'
import { deleteImage, updateBarometer, updateManufacturer } from '@/utils/fetch'
import { ManufacturerImageEdit } from './manufacturer-image-edit'
import { type ManufacturerForm } from './types'
import { getThumbnailBase64 } from '@/utils/misc'
import { imageStorage } from '@/utils/constants'
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
import { Label } from '@/components/ui/label'
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
// no tooltips, no shadcn form wrapper here

interface ManufacturerEditProps extends ComponentProps<'button'> {
  size?: string | number
  barometer: BarometerDTO
}

const initialValues: ManufacturerForm = {
  id: '',
  name: '',
  firstName: '',
  city: '',
  countries: [],
  url: '',
  description: '',
  successors: [],
  images: [],
}

export function ManufacturerEdit({
  size = 18,
  barometer,
  className,
  ...props
}: ManufacturerEditProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { manufacturers, countries } = useBarometers()
  const [selectedManufacturerIndex, setSelectedManufacturerIndex] = useState<number>(0)
  const currentBrand = useMemo(
    () => manufacturers.data[selectedManufacturerIndex],
    [manufacturers.data, selectedManufacturerIndex],
  )
  const brandImages = useMemo(
    () => currentBrand?.images?.map(({ url }) => url),
    [currentBrand?.images],
  )

  // Prepare form-friendly data derived from the current brand
  const currentBrandFormData = useMemo<ManufacturerForm>(() => {
    return {
      id: currentBrand?.id ?? '',
      name: currentBrand?.name ?? '',
      firstName: currentBrand?.firstName ?? '',
      city: currentBrand?.city ?? '',
      countries: currentBrand?.countries?.map(({ id }) => id) ?? [],
      description: currentBrand?.description ?? '',
      url: currentBrand?.url ?? '',
      successors: currentBrand?.successors?.map(({ id }) => id) ?? [],
      images: currentBrand?.images?.map(({ url }) => url) ?? [],
    }
  }, [currentBrand])

  const validationSchema: yup.ObjectSchema<ManufacturerForm> = yup
    .object({
      id: yup.string().default(''),
      name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name should be longer than 2 symbols')
        .max(100, 'Name should be shorter than 100 symbols'),
      firstName: yup.string().default(''),
      city: yup.string().max(100, 'City should be shorter than 100 symbols').default(''),
      countries: yup.array().of(yup.number().integer().required()).defined().default([]),
      url: yup
        .string()
        .test('is-url', 'Must be a valid URL', value => !value || /^(https?:\/\/).+/i.test(value))
        .default(''),
      description: yup.string().default(''),
      successors: yup.array().of(yup.string().required()).defined().default([]),
      images: yup.array().of(yup.string().required()).defined().default([]),
    })
    .required()

  const form = useForm<ManufacturerForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const cleanupOnClose = async () => {
    // delete unused files from storage
    try {
      setIsLoading(true)
      const currentImages = form.getValues('images')
      const extraImages = currentImages.filter(img => !brandImages?.includes(img))
      await Promise.all(extraImages.map(deleteImage))
    } catch (error) {
      // do nothing
    } finally {
      setIsLoading(false)
    }
  }

  // Reset selected manufacturer index only
  const resetManufacturerIndex = useCallback(() => {
    const manufacturerIndex = manufacturers.data.findIndex(
      ({ id }) => id === barometer.manufacturer.id,
    )
    setSelectedManufacturerIndex(manufacturerIndex)
  }, [barometer.manufacturer.id, manufacturers.data])

  // when dialog opens we'll reset index; form will be updated by effect below

  // Update form values when selected manufacturer changes
  useEffect(() => {
    if (currentBrand) {
      form.reset(currentBrandFormData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManufacturerIndex, currentBrandFormData])

  const update = useCallback(
    async (formValues: ManufacturerForm) => {
      setIsLoading(true)
      try {
        // erase deleted images
        const extraFiles = brandImages?.filter(url => !formValues.images.includes(url))
        if (extraFiles)
          await Promise.all(
            extraFiles?.map(async file => {
              try {
                await deleteImage(file)
              } catch (error) {
                // don't mind if it was not possible to delete the file
              }
            }),
          )

        const updatedBarometer = {
          id: barometer.id,
          manufacturerId: currentBrand.id,
        }
        const updatedManufacturer = {
          ...formValues,
          successors: formValues.successors.map(id => ({ id })),
          countries: formValues.countries.map(id => ({ id })),
          images: await Promise.all(
            formValues.images.map(async (url, i) => {
              const blurData = await getThumbnailBase64(imageStorage + url)
              return {
                url,
                order: i,
                name: barometer.name,
                blurData,
              }
            }),
          ),
        }
        const [{ slug }, { name }] = await Promise.all([
          updateBarometer(updatedBarometer),
          updateManufacturer(updatedManufacturer),
        ])
        toast.success(`${name} updated`)
        // Small delay to show toast before redirect
        setTimeout(() => {
          window.location.href = FrontRoutes.Barometer + (slug ?? '')
        }, 1000)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating manufacturer')
      } finally {
        setIsLoading(false)
      }
    },
    [barometer.id, barometer.name, brandImages, currentBrand?.id],
  )
  return (
    <>
      <Dialog
        onOpenChange={async isOpen => {
          if (isOpen) {
            resetManufacturerIndex()
            // Don't reset to initialValues - let useEffect handle the proper data
            return
          }
          await cleanupOnClose()
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Edit manufacturer"
            className={cn('h-fit w-fit p-1', className)}
            {...props}
          >
            <Edit className="text-destructive" size={Number(size) || 18} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          {isLoading ? (
            <div className="bg-background/60 absolute inset-0 z-50 flex items-center justify-center">
              <div className="border-muted-foreground h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : null}
          <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(update)} noValidate>
              <DialogHeader className="mt-6 mb-2">
                <div className="flex items-center justify-between">
                  <DialogTitle>Edit Manufacturer</DialogTitle>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label="Delete manufacturer"
                    onClick={() => manufacturers.delete(currentBrand?.slug)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <DialogDescription>
                  Edit manufacturer information and update barometer details.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                <Label htmlFor="manufacturer-select">Manufacturer</Label>
                <UiSelect
                  value={String(selectedManufacturerIndex)}
                  onValueChange={val => setSelectedManufacturerIndex(Number(val))}
                >
                  <SelectTrigger
                    id="manufacturer-select"
                    aria-label="Manufacturer"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[500px]">
                    {manufacturers.data.map(({ name }, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input id="firstName" {...field} />
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
                      <FormLabel>Name / Company name</FormLabel>
                      <FormControl>
                        <Input id="manufacturer-name" autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Countries</FormLabel>
                    <FormControl>
                      <CountriesMultiSelect
                        selected={(field.value as number[]) ?? []}
                        options={countries.data?.map(({ id, name }) => ({ id, name })) ?? []}
                        onChange={vals => field.onChange(vals)}
                        placeholder={
                          ((field.value as number[]) ?? []).length === 0
                            ? 'Select countries'
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input id="city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External URL</FormLabel>
                      <FormControl>
                        <Input id="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="successors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Successors</FormLabel>
                    <FormControl>
                      <SuccessorsMultiSelect
                        selected={(field.value as string[]) ?? []}
                        options={manufacturers.data.map(({ id, name }) => ({ id, name }))}
                        onChange={vals => field.onChange(vals)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ManufacturerImageEdit
                imageUrls={brandImages}
                form={form}
                setLoading={setIsLoading}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea id="description" autoResize {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="outline" className="w-full">
                Update
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Countries multiselect (numbers)
function CountriesMultiSelect({
  selected,
  options,
  onChange,
  placeholder,
}: {
  selected: number[]
  options: { id: number; name: string }[]
  onChange: (values: number[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length === 0
            ? placeholder || 'Select countries'
            : `${selected.length} selected`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => {
                const isActive = selected.includes(opt.id)
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => {
                      const next = isActive
                        ? selected.filter(v => v !== opt.id)
                        : [...selected, opt.id]
                      onChange(next)
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isActive ? 'bg-primary text-primary-foreground' : 'opacity-50',
                      )}
                    >
                      {isActive ? '✓' : ''}
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
  )
}

// Successors multiselect (strings)
function SuccessorsMultiSelect({
  selected,
  options,
  onChange,
}: {
  selected: string[]
  options: { id: string; name: string }[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length === 0 ? 'Select brands' : `${selected.length} selected`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search brand..." />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No brand found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => {
                const isActive = selected.includes(opt.id)
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => {
                      const next = isActive
                        ? selected.filter(v => v !== opt.id)
                        : [...selected, opt.id]
                      onChange(next)
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isActive ? 'bg-primary text-primary-foreground' : 'opacity-50',
                      )}
                    >
                      {isActive ? '✓' : ''}
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
  )
}
