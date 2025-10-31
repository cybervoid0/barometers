'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ClearButton, EditButton, RequiredFieldMark } from '@/components/elements'
import {
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui'
import { updateBarometer } from '@/server/barometers/actions'
import type { BarometerDTO } from '@/server/barometers/queries'
import type { AllBrandsDTO } from '@/server/brands/queries'
import { cn } from '@/utils'

interface Props {
  barometer: NonNullable<BarometerDTO>
  brands: AllBrandsDTO
}

const validationSchema = z.object({
  brandId: z.string().nonempty('Brand is required'),
})

type BrandForm = z.output<typeof validationSchema>

function getBrandName(name: string, firstName?: string | null): string
function getBrandName(name: string | undefined, firstName?: string | null): string | undefined
function getBrandName(name?: string, firstName?: string | null): string | undefined {
  return name ? `${firstName ? `${firstName} ` : ''}${name}` : undefined
}

function BrandEdit({ brands, barometer }: Props) {
  const [open, setOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState('')

  const [isPending, startTransition] = useTransition()

  const form = useForm<BrandForm>({
    resolver: zodResolver(validationSchema),
  })

  // reset form on open
  useEffect(() => {
    if (!open) return
    form.reset({ brandId: barometer.manufacturerId })
    setBrandSearch('')
  }, [open, barometer, form])

  const update = useCallback(
    (values: BrandForm) => {
      if (values.brandId === barometer.manufacturerId) {
        toast.info(`Nothing was updated in ${barometer.name}.`)
        setOpen(false)
        return
      }
      startTransition(async () => {
        try {
          const result = await updateBarometer({
            id: barometer.id,
            manufacturerId: values.brandId,
          })
          if (!result.success) throw new Error(result.error)
          const { name } = result.data
          setOpen(false)
          toast.success(`Updated brand in ${name}.`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error updating barometer brand')
        }
      })
    },
    [barometer.manufacturerId, barometer.name, barometer.id],
  )
  const brandId = form.watch('brandId')
  const selectedBrandName = useMemo(() => {
    const selectedBrand = brands.find(brand => String(brand.id) === brandId)
    return getBrandName(selectedBrand?.name, selectedBrand?.firstName)
  }, [brandId, brands])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <EditButton title="Change brand" />
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-visible">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(update)} noValidate>
            <DialogHeader>
              <DialogTitle>Change Brand</DialogTitle>
              <DialogDescription>Update the manufacturer for this barometer.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Brand <RequiredFieldMark />
                    </FormLabel>
                    <div className="space-y-2">
                      <div className="h-10 px-3 mt-1 flex items-center border border-border rounded-md cursor-default">
                        <p className="text-sm text-muted-foreground">
                          {selectedBrandName ?? 'None selected'}
                        </p>
                      </div>

                      <div className="border rounded-md">
                        <Command defaultValue={selectedBrandName ?? ''}>
                          <div className="relative">
                            <CommandInput
                              value={brandSearch}
                              onValueChange={setBrandSearch}
                              placeholder="Search brands..."
                              autoFocus={false}
                            />
                            <ClearButton onClick={() => setBrandSearch('')} />
                          </div>

                          <CommandList className="max-h-48 overflow-y-auto">
                            <CommandEmpty>No brand found.</CommandEmpty>
                            <CommandGroup>
                              {brands.map(({ name, id, firstName }) => {
                                const fullName = getBrandName(name, firstName)
                                return (
                                  <CommandItem
                                    key={id}
                                    value={fullName}
                                    onSelect={() => field.onChange(String(id))}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        id === field.value ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {fullName}
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <Button disabled={isPending} type="submit" variant="outline" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export { BrandEdit }
