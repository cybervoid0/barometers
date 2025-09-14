'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { IconUpload, RequiredFieldMark } from '@/components/elements'
import * as UI from '@/components/ui'
import { imageStorage } from '@/constants'
import { deleteBrand, updateBrand } from '@/server/brands/actions'
import type { AllBrandsDTO, BrandDTO } from '@/server/brands/queries'
import type { CountryListDTO } from '@/server/counties/queries'
import { deleteImages } from '@/server/images/actions'
import { generateIcon, getThumbnailBase64 } from '@/utils'
import { type BrandEditForm, brandEditSchema } from './brand-edit-schema'
import { BrandImageEdit } from './brand-image-edit'

interface Props {
  brand: BrandDTO
  countries: CountryListDTO
  brands: AllBrandsDTO
}

export function BrandEdit({ brand, countries, brands }: Props) {
  const [openBrandDialog, setOpenBrandDialog] = useState(false)
  const closeBrandDialog = useCallback(() => setOpenBrandDialog(false), [])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const closeDeleteDialog = useCallback(() => setOpenDeleteDialog(false), [])
  const [isPending, startTransition] = useTransition()
  const brandImages = useMemo(() => brand.images.map(img => img.url), [brand.images])
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false)

  const form = useForm<BrandEditForm>({
    resolver: zodResolver(brandEditSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const handleIconChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        form.setValue('icon', null, { shouldDirty: true })
        return
      }
      try {
        const fileUrl = URL.createObjectURL(file)
        const iconData = await generateIcon(fileUrl, 50)
        URL.revokeObjectURL(fileUrl)
        form.setValue('icon', iconData, { shouldDirty: true })
      } catch (error) {
        form.setValue('icon', null, { shouldDirty: true })
        toast.error(error instanceof Error ? error.message : 'Image cannot be opened')
      }
    },
    [form],
  )

  const onUpdate = useCallback(
    ({ images, countries, successors, ...values }: BrandEditForm) => {
      startTransition(async () => {
        try {
          if (!form.formState.isDirty) {
            toast.info(`${values.name} was not updated`)
            closeBrandDialog()
            return
          }

          const imageData = await Promise.all(
            images.map(async (url, i) => {
              const blurData = await getThumbnailBase64(imageStorage + url)
              return {
                url,
                order: i,
                name: values.name,
                blurData,
              }
            }),
          )

          const brandWithRelations = {
            ...values,
            successors: {
              set: successors.map(id => ({ id })),
            },
            countries: {
              set: countries.map(id => ({ id })),
            },
            images: {
              deleteMany: {},
              create: imageData,
            },
          }

          const { name } = await updateBrand(brandWithRelations)

          // Remove images that were deleted from form
          const extraImages = brandImages.filter(brandImage => !images.includes(brandImage))
          if (extraImages.length > 0) deleteImages(extraImages)

          toast.success(`Brand ${name} was updated`)
          setIsSubmitSuccessful(true)
          closeBrandDialog()
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : `Error updating brand ${values.name}.`,
          )
        }
      })
    },
    [brandImages, closeBrandDialog, form.formState.isDirty],
  )

  const onDelete = useCallback(() => {
    startTransition(async () => {
      try {
        await deleteBrand(brand.slug)
        toast.success(`Brand ${brand.name} was deleted`)
        closeDeleteDialog()
        closeBrandDialog()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Error deleting brand ${brand.name}.`)
      }
    })
  }, [brand, closeBrandDialog, closeDeleteDialog])

  const cleanUpOnClose = useCallback(() => {
    if (isSubmitSuccessful) return
    startTransition(async () => {
      try {
        // Clean up temporary uploaded images on dialog close
        const uploadedImages = form.getValues('images')
        const extraImages = uploadedImages.filter(img => !brandImages?.includes(img))
        await deleteImages(extraImages)
      } catch (_error) {}
    })
  }, [brandImages, form.getValues, isSubmitSuccessful])

  // Update form values when selected manufacturer changes
  useEffect(() => {
    if (!openBrandDialog) return cleanUpOnClose()
    setIsSubmitSuccessful(false)
    form.reset({
      id: brand.id,
      name: brand.name,
      firstName: brand.firstName ?? '',
      city: brand.city ?? '',
      url: brand.url ?? '',
      description: brand.description ?? '',
      images: brandImages,
      successors: brand.successors.map(({ id }) => id),
      countries: brand.countries.map(({ id }) => id),
      icon: brand.icon,
    })
  }, [openBrandDialog, brand, brandImages, form.reset, cleanUpOnClose])

  return (
    <UI.Dialog open={openBrandDialog} onOpenChange={setOpenBrandDialog}>
      <UI.DialogTrigger asChild>
        <UI.Button variant="ghost" aria-label="Edit manufacturer" className="h-fit w-fit p-1">
          <Edit className="text-destructive" size={18} />
        </UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent>
        <UI.DialogHeader>
          <div className="flex items-center gap-4">
            <UI.DialogTitle>Edit {brand.name}</UI.DialogTitle>
            <UI.AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <UI.AlertDialogTrigger asChild>
                <UI.Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Delete manufacturer"
                  className="w-6 h-6"
                >
                  <Trash2 className="h-4 w-4" />
                </UI.Button>
              </UI.AlertDialogTrigger>
              <UI.AlertDialogContent>
                <UI.AlertDialogHeader>
                  <UI.AlertDialogTitle>Delete Brand</UI.AlertDialogTitle>
                  <UI.AlertDialogDescription>
                    Are you sure you want to delete "{brand.name}"? This action cannot be undone.
                  </UI.AlertDialogDescription>
                </UI.AlertDialogHeader>
                <UI.AlertDialogFooter>
                  <UI.AlertDialogCancel>Cancel</UI.AlertDialogCancel>
                  <UI.AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </UI.AlertDialogAction>
                </UI.AlertDialogFooter>
              </UI.AlertDialogContent>
            </UI.AlertDialog>
          </div>
          <UI.DialogDescription>Update manufacturer details.</UI.DialogDescription>
        </UI.DialogHeader>
        <UI.FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onUpdate)} noValidate className="space-y-4">
            <UI.FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>First name</UI.FormLabel>
                  <UI.FormControl>
                    <UI.Input {...field} />
                  </UI.FormControl>
                </UI.FormItem>
              )}
            />

            <UI.FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>
                    Last name <RequiredFieldMark />
                  </UI.FormLabel>
                  <UI.FormControl>
                    <UI.Input {...field} />
                  </UI.FormControl>
                </UI.FormItem>
              )}
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
                </UI.FormItem>
              )}
            />

            <UI.FormField
              control={form.control}
              name="countries"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>
                    Countries <RequiredFieldMark />
                  </UI.FormLabel>
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

            <div>
              <UI.FormLabel>Icon</UI.FormLabel>
              <IconUpload onFileChange={handleIconChange} currentIcon={form.watch('icon')} />
            </div>

            <BrandImageEdit imageUrls={brandImages} form={form} startTransition={startTransition} />

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

            <UI.DialogFooter className="mt-6">
              <UI.Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Update
              </UI.Button>
            </UI.DialogFooter>
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

  const selectedCountries = useMemo(
    () => options.filter(country => selected.includes(country.id)),
    [options, selected],
  )

  const handleSelect = useCallback(
    (countryId: number) => {
      if (selected.includes(countryId)) {
        onChange(selected.filter(id => id !== countryId))
      } else {
        onChange([...selected, countryId])
      }
    },
    [onChange, selected],
  )

  const handleRemove = useCallback(
    (countryId: number) => {
      onChange(selected.filter(id => id !== countryId))
    },
    [onChange, selected],
  )

  return (
    <div className="space-y-2">
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map(country => (
            <UI.Badge key={country.id} variant="default" className="px-2 py-1">
              {country.name}
              <UI.Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(country.id)}
              >
                <X className="h-3 w-3" />
              </UI.Button>
            </UI.Badge>
          ))}
        </div>
      )}
      <UI.Popover open={open} onOpenChange={setOpen} modal>
        <UI.PopoverTrigger asChild>
          <UI.Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            {selected.length === 0
              ? placeholder || 'Select countries'
              : `${selected.length} countr${selected.length === 1 ? 'y' : 'ies'} selected`}
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
                      onSelect={() => handleSelect(opt.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {isActive && <div className="h-2 w-2 bg-current rounded-full" />}
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
    </div>
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

  const selectedBrands = useMemo(
    () => options.filter(brand => selected.includes(brand.id)),
    [options, selected],
  )

  const handleSelect = useCallback(
    (brandId: string) => {
      if (selected.includes(brandId)) {
        onChange(selected.filter(id => id !== brandId))
      } else {
        onChange([...selected, brandId])
      }
    },
    [onChange, selected],
  )

  const handleRemove = useCallback(
    (brandId: string) => {
      onChange(selected.filter(id => id !== brandId))
    },
    [onChange, selected],
  )

  return (
    <div className="space-y-2">
      {selectedBrands.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBrands.map(brand => (
            <UI.Badge key={brand.id} variant="default" className="px-2 py-1">
              {brand.name}
              <UI.Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(brand.id)}
              >
                <X className="h-3 w-3" />
              </UI.Button>
            </UI.Badge>
          ))}
        </div>
      )}
      <UI.Popover open={open} onOpenChange={setOpen} modal>
        <UI.PopoverTrigger asChild>
          <UI.Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            {selected.length === 0
              ? 'Select brands'
              : `${selected.length} brand${selected.length === 1 ? '' : 's'} selected`}
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
                      onSelect={() => handleSelect(opt.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {isActive && <div className="h-2 w-2 bg-current rounded-full" />}
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
    </div>
  )
}
