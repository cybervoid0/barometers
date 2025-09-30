'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormImageUpload, MultiSelect, RequiredFieldMark } from '@/components/elements'
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { createBarometer } from '@/server/barometers/actions'
import type { AllBrandsDTO } from '@/server/brands/queries'
import type { CategoriesDTO } from '@/server/categories/queries'
import type { ConditionsDTO } from '@/server/conditions/queries'
import type { MaterialsDTO } from '@/server/materials/queries'
import type { MovementsDTO } from '@/server/movements/queries'
import { cn } from '@/utils'
import {
  type BarometerFormData,
  BarometerFormTransformSchema,
  BarometerFormValidationSchema,
} from './barometer-form.schema'
import { Dimensions } from './dimensions'

interface Props {
  conditions: ConditionsDTO
  categories: CategoriesDTO
  movements: MovementsDTO
  materials: MaterialsDTO
  brands: AllBrandsDTO
}

export default function BarometerForm({
  categories,
  conditions,
  movements,
  materials,
  brands,
}: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<BarometerFormData>({
    resolver: zodResolver(BarometerFormValidationSchema),
    defaultValues: {
      collectionId: '',
      name: '',
      categoryId: '',
      date: '1900',
      dateDescription: '',
      manufacturerId: '',
      conditionId: '',
      description: '',
      dimensions: [],
      images: [],
      purchasedAt: '',
      serial: '',
      estimatedPrice: '',
      subCategoryId: 'none',
      materials: [],
    },
  })

  const { handleSubmit, setValue, reset, control } = form

  const submitForm = (values: BarometerFormData) => {
    startTransition(async () => {
      try {
        // Transform schema does ALL the heavy lifting - validation AND transformation!
        const transformedData = await BarometerFormTransformSchema.parseAsync(values)
        const result = await createBarometer(transformedData)
        if (!result.success) throw new Error(result.error)
        reset()
        toast.success(`Added barometer ${transformedData.name} to the database`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error adding barometer')
      }
    })
  }

  // Set default values when data loads
  useEffect(() => {
    reset({
      categoryId: categories[0].id,
      manufacturerId: brands[0].id,
      conditionId: conditions.at(-1)?.id,
    })
  }, [categories, conditions, brands, reset])

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
        <FormField
          control={control}
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Catalogue No. <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter AWIF catalogue #" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter serial number" maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter barometer name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Year <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  maxLength={4}
                  onChange={e => {
                    const year = e.target.value.replace(/\D/g, '').slice(0, 4)
                    field.onChange(year)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dateDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date description <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter date description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="purchasedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    {...field}
                    value={field.value || ''}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('purchasedAt', '')}
                    className="shrink-0"
                  >
                    Clear
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="estimatedPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Price, €</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="100"
                  min="0"
                  placeholder="Enter estimated price in Euro"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials</FormLabel>
              <FormControl>
                <MultiSelect
                  selected={field.value || []}
                  onChange={field.onChange}
                  options={materials?.map(m => ({ id: m.id, name: m.name })) ?? []}
                  placeholder="Select materials..."
                  searchPlaceholder="Search materials..."
                  emptyMessage="No materials found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <RequiredFieldMark />
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {categories.map(({ name, id }) => (
                    <SelectItem key={id} value={String(id)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="subCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movement Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select movement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">No type</SelectItem>
                  {movements.map(({ name, id }) => (
                    <SelectItem key={id} value={String(id)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="manufacturerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Manufacturer <RequiredFieldMark />
              </FormLabel>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value
                          ? brands.find(brand => String(brand.id) === field.value)?.name
                          : 'Select manufacturer'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <Command>
                      <CommandInput placeholder="Search manufacturers..." />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty>No manufacturer found.</CommandEmpty>
                        <CommandGroup>
                          {brands.map(({ name, id }) => (
                            <CommandItem
                              key={id}
                              value={name}
                              onSelect={() => {
                                field.onChange(String(id))
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  String(id) === field.value ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conditionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Condition <RequiredFieldMark />
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {conditions.map(({ name, id }) => (
                    <SelectItem key={id} value={String(id)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormImageUpload />

        <Dimensions />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  autoResize
                  placeholder="Enter barometer description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-6 w-full">
          {isPending ? 'Adding...' : 'Add new barometer'}
        </Button>
      </form>
    </FormProvider>
  )
}
