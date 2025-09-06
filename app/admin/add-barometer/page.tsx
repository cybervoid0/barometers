'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useTransition } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBarometers } from '@/hooks/useBarometers'
import { createBarometer } from '@/lib/barometers/actions'
import {
  type BarometerFormData,
  BarometerFormTransformSchema,
  BarometerFormValidationSchema,
} from '@/lib/schemas/barometer-form.schema'
import { AddManufacturer } from './add-manufacturer'
import { MaterialsMultiSelect } from './add-materials'
import { Dimensions } from './dimensions'
import { FileUpload } from './file-upload'

export default function AddCard() {
  const { condition, categories, subcategories, manufacturers, materials } = useBarometers()
  const [isPending, startTransition] = useTransition()

  const methods = useForm<BarometerFormData>({
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

  const { handleSubmit, setValue, reset, control } = methods

  const submitForm = (values: BarometerFormData) => {
    startTransition(async () => {
      try {
        // Transform schema does ALL the heavy lifting - validation AND transformation!
        const transformedData = await BarometerFormTransformSchema.parseAsync(values)
        const { id } = await createBarometer(transformedData)
        reset()
        toast.success(`Added ${id} to the database`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error adding barometer')
      }
    })
  }

  // Set default values when data loads
  useEffect(() => {
    if (categories.data.length > 0) {
      setValue('categoryId', String(categories.data[0].id))
    }
  }, [categories.data, setValue])

  useEffect(() => {
    if (condition.data.length > 0) {
      setValue('conditionId', String(condition.data.at(-1)?.id))
    }
  }, [condition.data, setValue])

  useEffect(() => {
    if (manufacturers.data.length > 0) {
      setValue('manufacturerId', String(manufacturers.data[0].id))
    }
  }, [manufacturers.data, setValue])

  const handleAddManufacturer = (id: string) => {
    setValue('manufacturerId', id)
  }

  return (
    <div className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new barometer</h3>

      <FormProvider {...methods}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
            <FormField
              control={control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catalogue No. *</FormLabel>
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
                  <FormLabel>Title *</FormLabel>
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
                  <FormLabel>Year *</FormLabel>
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
                  <FormLabel>Date description *</FormLabel>
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
                    <MaterialsMultiSelect
                      value={field.value || []}
                      onChange={field.onChange}
                      materials={materials.data ?? []}
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
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={
                      field.value ||
                      (categories.data.length > 0 ? String(categories.data[0].id) : '')
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {categories.data.map(({ name, id }) => (
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
                      {subcategories.data.map(({ name, id }) => (
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
                  <FormLabel>Manufacturer *</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={field.onChange}
                      value={
                        field.value ||
                        (manufacturers.data.length > 0 ? String(manufacturers.data[0].id) : '')
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {manufacturers.data.map(({ name, id }) => (
                          <SelectItem key={id} value={String(id)}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <AddManufacturer onAddManufacturer={handleAddManufacturer} />
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
                  <FormLabel>Condition *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={
                      field.value ||
                      (condition.data.length > 0 ? String(condition.data.at(-1)?.id) : '')
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {condition.data.map(({ name, id }) => (
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

            <FileUpload name="images" />

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

            <Button type="submit" variant="outline" disabled={isPending} className="mt-6">
              {isPending ? 'Adding...' : 'Add new barometer'}
            </Button>
          </form>
        </FormProvider>
      </FormProvider>
    </div>
  )
}
