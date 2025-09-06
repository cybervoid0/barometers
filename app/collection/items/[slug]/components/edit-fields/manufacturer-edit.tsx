'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Trash2 } from 'lucide-react'
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { imageStorage } from '@/constants/globals'
import { updateBarometer } from '@/lib/barometers/actions'
import type { BarometerDTO } from '@/lib/barometers/queries'
import { deleteBrand, updateBrand } from '@/lib/brands/actions'
import type { AllBrandsDTO } from '@/lib/brands/queries'
import type { CountryListDTO } from '@/lib/counties/queries'
import { deleteImage } from '@/services/fetch'
import { cn, getThumbnailBase64 } from '@/utils'
import { ManufacturerImageEdit } from './manufacturer-image-edit'

interface ManufacturerEditProps extends ComponentProps<'button'> {
  size?: string | number
  barometer: NonNullable<BarometerDTO>
  brands: AllBrandsDTO
  countries: CountryListDTO
}

const validationSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name should be longer than 2 symbols')
    .max(100, 'Name should be shorter than 100 symbols'),
  firstName: z.string(),
  city: z.string().max(100, 'City should be shorter than 100 symbols'),
  countries: z.array(z.number().int()),
  url: z.string().refine(value => !value || /^(https?:\/\/).+/i.test(value), 'Must be a valid URL'),
  description: z.string(),
  successors: z.array(z.string()),
  images: z.array(z.string()),
})

type ManufacturerForm = z.output<typeof validationSchema>

export function ManufacturerEdit({
  size = 18,
  barometer,
  brands,
  countries,
  className,
  ...props
}: ManufacturerEditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedManufacturerIndex, setSelectedManufacturerIndex] = useState<number>(0)
  const currentBrand = useMemo(
    () => brands[selectedManufacturerIndex],
    [brands, selectedManufacturerIndex],
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

  const form = useForm<ManufacturerForm>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      id: '',
      name: '',
      firstName: '',
      city: '',
      countries: [],
      url: '',
      description: '',
      successors: [],
      images: [],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: form not gonna change
  const cleanupOnClose = useCallback(async () => {
    // delete unused files from storage
    try {
      setIsLoading(true)
      const currentImages = form.getValues('images')
      const extraImages = currentImages.filter(img => !brandImages?.includes(img))
      await Promise.all(extraImages.map(deleteImage))
    } catch (_error) {
      // do nothing
    } finally {
      setIsLoading(false)
    }
  }, [brandImages])

  // Reset selected manufacturer index only
  const resetManufacturerIndex = useCallback(() => {
    const manufacturerIndex = brands.findIndex(({ id }) => id === barometer.manufacturer.id)
    setSelectedManufacturerIndex(manufacturerIndex)
  }, [barometer.manufacturer.id, brands])

  // when dialog opens we'll reset index; form will be updated by effect below

  // Update form values when selected manufacturer changes
  useEffect(() => {
    if (currentBrand) {
      form.reset(currentBrandFormData)
    }
  }, [currentBrandFormData, currentBrand, form.reset])

  const update = useCallback(
    (formValues: ManufacturerForm) => {
      startTransition(async () => {
        try {
          // Check if manufacturer changed
          if (currentBrand.id !== barometer.manufacturer.id) {
            toast.info(`Brand was not updated`)
            return setOpen(false)
          }

          // erase deleted images
          const extraFiles = brandImages?.filter(url => !formValues.images.includes(url))
          if (extraFiles)
            await Promise.all(
              extraFiles?.map(async file => {
                try {
                  await deleteImage(file)
                } catch (_error) {
                  // don't mind if it was not possible to delete the file
                }
              }),
            )

          const updatedBarometer = {
            id: barometer.id,
            manufacturerId: currentBrand.id,
          }

          const imageData = await Promise.all(
            formValues.images.map(async (url, i) => {
              const blurData = await getThumbnailBase64(imageStorage + url)
              return {
                url,
                order: i,
                name: barometer.name,
                blurData,
              }
            }),
          )

          const updatedManufacturer = {
            ...formValues,
            successors: {
              set: formValues.successors.map(id => ({ id })),
            },
            countries: {
              set: formValues.countries.map(id => ({ id })),
            },
            images: {
              deleteMany: {},
              create: imageData,
            },
          }

          const [{ name: barometerName }, { name: manufacturerName }] = await Promise.all([
            updateBarometer(updatedBarometer),
            updateBrand(updatedManufacturer),
          ])

          setOpen(false)
          toast.success(`Updated manufacturer to ${manufacturerName} in ${barometerName}.`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error updating manufacturer')
        }
      })
    },
    [barometer.id, barometer.name, barometer.manufacturer.id, brandImages, currentBrand?.id],
  )
  // reset form on open and cleanup on close
  useEffect(() => {
    if (open) {
      resetManufacturerIndex()
    } else {
      cleanupOnClose()
    }
  }, [open, resetManufacturerIndex, cleanupOnClose])

  return (
    <UI.Dialog open={open} onOpenChange={setOpen}>
      <UI.DialogTrigger asChild>
        <UI.Button
          variant="ghost"
          aria-label="Edit manufacturer"
          className={cn('h-fit w-fit p-1', className)}
          {...props}
        >
          <Edit className="text-destructive" size={Number(size) || 18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent>
        {isLoading ? (
          <div className="bg-background/60 absolute inset-0 z-50 flex items-center justify-center">
            <div className="border-muted-foreground h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : null}
        <UI.FormProvider {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(update)} noValidate>
            <UI.DialogHeader className="mt-6 mb-2">
              <div className="flex items-center justify-between">
                <UI.DialogTitle>Edit Manufacturer</UI.DialogTitle>
                <UI.Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Delete manufacturer"
                  onClick={() => deleteBrand(currentBrand?.slug)}
                >
                  <Trash2 className="h-4 w-4" />
                </UI.Button>
              </div>
              <UI.DialogDescription>
                Edit manufacturer information and update barometer details.
              </UI.DialogDescription>
            </UI.DialogHeader>

            <div className="flex flex-col gap-2">
              <UI.Label>Manufacturer</UI.Label>
              <UI.Select
                value={String(selectedManufacturerIndex)}
                onValueChange={val => setSelectedManufacturerIndex(Number(val))}
              >
                <UI.SelectTrigger aria-label="Manufacturer" className="w-full">
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent className="max-h-[500px]">
                  {brands.map(({ name, id }, i) => (
                    <UI.SelectItem key={id} value={String(i)}>
                      {name}
                    </UI.SelectItem>
                  ))}
                </UI.SelectContent>
              </UI.Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <UI.FormLabel>Name / Company name</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Input autoFocus {...field} />
                    </UI.FormControl>
                    <UI.FormMessage />
                  </UI.FormItem>
                )}
              />
            </div>

            <UI.FormField
              control={form.control}
              name="countries"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Countries</UI.FormLabel>
                  <UI.FormControl>
                    <CountriesMultiSelect
                      selected={(field.value as number[]) ?? []}
                      options={countries?.map(({ id, name }) => ({ id, name })) ?? []}
                      onChange={vals => field.onChange(vals)}
                      placeholder={
                        ((field.value as number[]) ?? []).length === 0
                          ? 'Select countries'
                          : undefined
                      }
                    />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                name="url"
                render={({ field }) => (
                  <UI.FormItem>
                    <UI.FormLabel>External URL</UI.FormLabel>
                    <UI.FormControl>
                      <UI.Input {...field} />
                    </UI.FormControl>
                    <UI.FormMessage />
                  </UI.FormItem>
                )}
              />
            </div>

            <UI.FormField
              control={form.control}
              name="successors"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Successors</UI.FormLabel>
                  <UI.FormControl>
                    <SuccessorsMultiSelect
                      selected={(field.value as string[]) ?? []}
                      options={brands.map(({ id, name }) => ({ id, name }))}
                      onChange={vals => field.onChange(vals)}
                    />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <ManufacturerImageEdit imageUrls={brandImages} form={form} setLoading={setIsLoading} />

            <UI.FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Description</UI.FormLabel>
                  <UI.FormControl>
                    <UI.Textarea autoResize {...field} />
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <UI.Button
              disabled={isPending || isLoading}
              type="submit"
              variant="outline"
              className="w-full"
            >
              Update
            </UI.Button>
          </form>
        </UI.FormProvider>
      </UI.DialogContent>
    </UI.Dialog>
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
    <UI.Popover open={open} onOpenChange={setOpen} modal>
      <UI.PopoverTrigger asChild>
        <UI.Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length === 0
            ? placeholder || 'Select countries'
            : `${selected.length} selected`}
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <UI.Command>
          <UI.CommandInput placeholder="Search country..." />
          <UI.CommandList className="max-h-[200px]">
            <UI.CommandEmpty>No country found.</UI.CommandEmpty>
            <UI.CommandGroup>
              {options.map(opt => {
                const isActive = selected.includes(opt.id)
                return (
                  <UI.CommandItem
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
                  </UI.CommandItem>
                )
              })}
            </UI.CommandGroup>
          </UI.CommandList>
        </UI.Command>
      </UI.PopoverContent>
    </UI.Popover>
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
    <UI.Popover open={open} onOpenChange={setOpen} modal>
      <UI.PopoverTrigger asChild>
        <UI.Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length === 0 ? 'Select brands' : `${selected.length} selected`}
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <UI.Command>
          <UI.CommandInput placeholder="Search brand..." />
          <UI.CommandList className="max-h-[200px]">
            <UI.CommandEmpty>No brand found.</UI.CommandEmpty>
            <UI.CommandGroup>
              {options.map(opt => {
                const isActive = selected.includes(opt.id)
                return (
                  <UI.CommandItem
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
                  </UI.CommandItem>
                )
              })}
            </UI.CommandGroup>
          </UI.CommandList>
        </UI.Command>
      </UI.PopoverContent>
    </UI.Popover>
  )
}
