'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { IconUpload, ImageUpload, PdfFilesUpload, RequiredFieldMark } from '@/components/elements'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  LoadingOverlay,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@/components/ui'
import { deleteBrand, updateBrand } from '@/server/brands/actions'
import type { AllBrandsDTO, BrandDTO } from '@/server/brands/queries'
import type { CountryListDTO } from '@/server/counties/queries'
import { deleteFiles } from '@/server/files/actions'
import type { MediaFile } from '@/types'
import { cn, generateIcon } from '@/utils'
import { type BrandEditForm, BrandEditSchema, BrandEditTransformSchema } from './brand-edit-schema'

interface Props {
  brand: BrandDTO
  countries: CountryListDTO
  brands: AllBrandsDTO
}

export function BrandEdit({ brand, countries, brands }: Props) {
  const [loading, setLoading] = useState(false)
  const [openBrandDialog, setOpenBrandDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const brandImages = useMemo(
    () => (brand.images ?? []).map(img => ({ name: img.name, url: img.url }) as MediaFile),
    [brand.images],
  )

  const pdfFiles = useMemo(
    () => (brand.pdfFiles ?? []).map(pdf => ({ name: pdf.name, url: pdf.url }) as MediaFile),
    [brand.pdfFiles],
  )

  const form = useForm<BrandEditForm>({
    resolver: zodResolver(BrandEditSchema),
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
    async (values: BrandEditForm) => {
      setLoading(true)
      try {
        if (!form.formState.isDirty) {
          toast.info(`${values.name} was not updated`)
          setOpenBrandDialog(false)
          return
        }
        // old images that are no longer in the form - prepare to delete
        const deletedImages = brandImages.filter(
          img => !values.images.some(({ url }) => img.url === url),
        )

        // update images in DB
        const result = await updateBrand(await BrandEditTransformSchema.parseAsync(values))
        if (!result.success) throw new Error(result.error)
        toast.success(`Brand ${result.data.name} was updated`)

        // prevents dialog blinking
        setTimeout(() => {
          setLoading(false)
          setOpenBrandDialog(false)
          if (deletedImages.length > 0) deleteFiles(deletedImages)
        }, 100)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Error updating brand ${values.name}.`)
        setLoading(false)
      }
    },
    [form.formState.isDirty, brandImages],
  )

  const onDelete = useCallback(async () => {
    try {
      setLoading(true)
      await deleteBrand(brand.slug)
      toast.success(`Brand ${brand.name} was deleted`)
      setOpenDeleteDialog(false)
      setOpenBrandDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Error deleting brand ${brand.name}.`)
    } finally {
      setLoading(false)
    }
  }, [brand])

  // Update form values when selected manufacturer changes
  useEffect(() => {
    form.reset({
      id: brand.id,
      name: brand.name,
      firstName: brand.firstName ?? '',
      city: brand.city ?? '',
      url: brand.url ?? '',
      description: brand.description ?? '',
      images: brand.images.map(({ url, name }) => ({ url, name: name ?? undefined })),
      pdfFiles: brand.pdfFiles?.map(({ url, name }) => ({ url, name: name ?? '' })) ?? [],
      successors: brand.successors.map(({ id }) => id),
      countries: brand.countries.map(({ id }) => id),
      icon: brand.icon,
    })
  }, [brand, form])

  return (
    <Dialog open={openBrandDialog} onOpenChange={setOpenBrandDialog}>
      <DialogTrigger asChild>
        <Button variant="ghost" aria-label="Edit manufacturer" className="h-fit w-fit p-1">
          <Edit className="text-destructive" size={18} />
        </Button>
      </DialogTrigger>

      <DialogContent className={cn({ 'overflow-hidden': loading })}>
        {loading && <LoadingOverlay />}
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Edit {brand.name}</DialogTitle>
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Delete manufacturer"
                  className="w-6 h-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{brand.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <DialogDescription>Update manufacturer details.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onUpdate)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last name <RequiredFieldMark />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
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
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="countries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Countries <RequiredFieldMark />
                  </FormLabel>
                  <FormControl>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="successors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Successors</FormLabel>
                  <FormControl>
                    <SuccessorsMultiSelect
                      selected={(field.value as string[]) ?? []}
                      options={brands.map(({ id, name }) => ({ id, name }))}
                      onChange={vals => field.onChange(vals)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ImageUpload existingImages={brandImages} isDialogOpen={openBrandDialog} />

            <div>
              <FormLabel>Icon</FormLabel>
              <IconUpload onFileChange={handleIconChange} currentIcon={form.watch('icon')} />
            </div>

            <PdfFilesUpload existingFiles={pdfFiles} isDialogOpen={openBrandDialog} />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea autoResize {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button disabled={loading} type="submit" variant="outline" className="w-full">
                Update
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
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
            <Badge key={country.id} variant="default" className="px-2 py-1">
              {country.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(country.id)}
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
            {selected.length === 0
              ? placeholder || 'Select countries'
              : `${selected.length} countr${selected.length === 1 ? 'y' : 'ies'} selected`}
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
            <Badge key={brand.id} variant="default" className="px-2 py-1">
              {brand.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => handleRemove(brand.id)}
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
            {selected.length === 0
              ? 'Select brands'
              : `${selected.length} brand${selected.length === 1 ? '' : 's'} selected`}
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
