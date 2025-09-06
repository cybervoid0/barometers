'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as UI from '@/components/ui'
import { deleteBrand, updateBrand } from '@/lib/brands/actions'
import type { BrandDTO } from '@/lib/brands/queries'
import type { CountryListDTO } from '@/lib/counties/queries'

interface Props {
  brand: BrandDTO
  countries: CountryListDTO
}

// Schema for form validation (input)
const brandFormSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name should be longer than 2 symbols')
    .max(100, 'Name should be shorter than 100 symbols'),
  firstName: z.string(),
  city: z.string().max(100, 'City should be shorter than 100 symbols'),
  countries: z.array(z.number().int()),
  url: z.string().url('URL should be valid internet domain').or(z.literal('')),
  description: z.string(),
  successors: z.array(z.string()),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
    }),
  ),
})

// Schema for API submission (output with transforms)
const brandApiSchema = brandFormSchema.extend({
  firstName: z.string().transform(val => (val === '' ? null : val)),
  city: z.string().transform(val => (val === '' ? null : val)),
  url: z.string().transform(val => (val === '' ? null : val)),
  description: z.string().transform(val => (val === '' ? null : val)),
})

type BrandForm = z.infer<typeof brandFormSchema>

export function BrandEdit({ brand, countries }: Props) {
  const [openBrandDialog, setOpenBrandDialog] = useState(false)
  const closeBrandDialog = () => setOpenBrandDialog(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const closeDeleteDialog = () => setOpenDeleteDialog(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<BrandForm>({
    resolver: zodResolver(brandFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const cleanUpOnClose = useCallback(() => {}, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: exclude closeDialog
  const onUpdate = useCallback(
    (values: BrandForm) => {
      startTransition(async () => {
        try {
          // Transform form data to API format (empty strings -> null)
          const apiData = brandApiSchema.parse(values)
          const { name } = await updateBrand({
            ...apiData,
            countries: {
              set: apiData.countries.map(id => ({ id })),
            },
            successors: {
              set: apiData.successors.map(id => ({ id })),
            },
            images: {
              set: apiData.images,
            },
          })
          toast.success(`Brand ${name} was updated`)
          closeBrandDialog()
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : `Error updating brand ${values.name}.`,
          )
        }
      })
    },
    [brand.name],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: exclude closeDialog
  const onDelete = useCallback(() => {
    startTransition(async () => {
      try {
        //await deleteBrand(brand.slug)
        toast.success(`Brand ${brand.name} was deleted`)
        closeDeleteDialog()
        closeBrandDialog()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Error deleting brand ${brand.name}.`)
      }
    })
  }, [brand])

  // Update form values when selected manufacturer changes
  useEffect(() => {
    if (!openBrandDialog) return cleanUpOnClose()
    form.reset({
      id: brand.id,
      name: brand.name,
      firstName: brand.firstName ?? '',
      city: brand.city ?? '',
      url: brand.url ?? '',
      description: brand.description ?? '',
      images: brand.images,
      successors: brand.successors.map(({ id }) => id),
      countries: brand.countries.map(({ id }) => id),
    })
  }, [openBrandDialog, brand, form.reset, cleanUpOnClose])

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
          <form onSubmit={form.handleSubmit(onUpdate)} noValidate>
            <UI.Button disabled={isPending} type="submit" variant="outline" className="w-full">
              Update
            </UI.Button>
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
          </form>
        </UI.FormProvider>
      </UI.DialogContent>
    </UI.Dialog>
  )
}
