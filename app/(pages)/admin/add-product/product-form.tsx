'use client'

import { Plus, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { ImageUpload, RequiredFieldMark } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui'
import { slug } from '@/utils'
import type { ProductFormData, ProductVariantInput } from './product-add-schema'

interface Props {
  onSubmit: (values: ProductFormData) => void
  children?: ReactNode
}

/**
 * Generate all combinations of option values
 */
function generateVariantCombinations(
  options: Array<{ name: string; values: string[] }>,
): Array<Record<string, string>> {
  if (options.length === 0) return [{}]

  const [first, ...rest] = options
  const restCombinations = generateVariantCombinations(rest)

  const combinations: Array<Record<string, string>> = []
  for (const value of first.values) {
    for (const combo of restCombinations) {
      combinations.push({ [first.name]: value, ...combo })
    }
  }

  return combinations
}

/**
 * Generate SKU from product name and options
 */
function generateSku(productName: string, options: Record<string, string>): string {
  const prefix = productName
    .split(' ')
    .map(w => slug(w).substring(0, 3).toUpperCase())
    .join('')
    .substring(0, 6)

  const optionPart = Object.values(options)
    .map(v => slug(v).substring(0, 3).toUpperCase())
    .join('-')

  return optionPart ? `${prefix}-${optionPart}` : prefix
}

function ProductForm({ onSubmit, children = null }: Props) {
  const { control, handleSubmit, setValue, getValues } = useFormContext<ProductFormData>()

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: 'options' })

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: 'variants',
  })

  // Watch options to regenerate variants
  const watchedOptions = useWatch({ control, name: 'options' })

  // Check if at least one option has values
  const hasAnyOptionValues = (watchedOptions || []).some(opt => opt.values?.length > 0)

  const handleAddOption = () => {
    appendOption({ name: '', values: [] })
  }

  const handleRemoveOption = (index: number) => {
    removeOption(index)
    // Regenerate variants after option removal
    setTimeout(() => handleGenerateVariants(), 0)
  }

  const handleAddOptionValue = (optionIndex: number, value: string) => {
    if (!value.trim()) return
    const currentValues = getValues(`options.${optionIndex}.values`) || []
    if (!currentValues.includes(value.trim())) {
      setValue(`options.${optionIndex}.values`, [...currentValues, value.trim()])
    }
  }

  const handleRemoveOptionValue = (optionIndex: number, valueIndex: number) => {
    const currentValues = getValues(`options.${optionIndex}.values`) || []
    setValue(
      `options.${optionIndex}.values`,
      currentValues.filter((_, i) => i !== valueIndex),
    )
  }

  const handleGenerateVariants = () => {
    const options = getValues('options') || []
    const productName = getValues('name') || 'PROD'

    // Filter out empty options
    const validOptions = options.filter(opt => opt.name && opt.values.length > 0)

    const combinations = generateVariantCombinations(validOptions)

    const newVariants: ProductVariantInput[] = combinations.map(combo => ({
      sku: generateSku(productName, combo),
      options: combo,
      priceEUR: '',
      priceUSD: '',
      stock: '0',
      weight: '',
    }))

    // If no options, create one default variant
    if (
      newVariants.length === 0 ||
      (newVariants.length === 1 && Object.keys(newVariants[0].options).length === 0)
    ) {
      newVariants.length = 0
      newVariants.push({
        sku: generateSku(productName, {}),
        options: {},
        priceEUR: '',
        priceUSD: '',
        stock: '0',
        weight: '',
      })
    }

    replaceVariants(newVariants)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* Basic Info Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Basic Info</h2>

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Product Name <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Barometer Postcard" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} placeholder="Product description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ImageUpload />
      </section>

      {/* Options Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-semibold">Options</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
            <Plus className="w-4 h-4 mr-1" /> Add Option
          </Button>
        </div>

        {optionFields.length === 0 && (
          <p className="text-sm text-muted-foreground">No options added.</p>
        )}

        {optionFields.map((field, optionIndex) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FormField
                control={control}
                name={`options.${optionIndex}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Option Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Size, Color, Paper..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => handleRemoveOption(optionIndex)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div>
              <FormLabel>Values</FormLabel>
              <div className="flex flex-wrap gap-2 mt-1">
                {(watchedOptions?.[optionIndex]?.values || []).map((value, valueIndex) => (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionValue(optionIndex, valueIndex)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <Input
                  placeholder="Add value..."
                  className="w-32"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddOptionValue(optionIndex, e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                  onBlur={e => {
                    if (e.target.value) {
                      handleAddOptionValue(optionIndex, e.target.value)
                      e.target.value = ''
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {optionFields.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleGenerateVariants}
            disabled={!hasAnyOptionValues}
          >
            Generate Variants
          </Button>
        )}
      </section>

      {/* Variants Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-semibold">Variants ({variantFields.length})</h2>
        </div>

        {variantFields.length === 0 ? (
          <div className="text-center py-8 border rounded-lg border-dashed">
            <p className="text-muted-foreground mb-4">
              {optionFields.length > 0
                ? 'Click "Generate Variants" to create variant combinations'
                : 'Add options above or a default variant will be created'}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateVariants}
              disabled={optionFields.length === 0}
            >
              Generate Variants
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">SKU</th>
                  {watchedOptions
                    ?.filter(o => o.name)
                    .map(opt => (
                      <th key={opt.name} className="text-left py-2 px-2">
                        {opt.name}
                      </th>
                    ))}
                  <th className="text-left py-2 px-2">€ EUR</th>
                  <th className="text-left py-2 px-2">$ USD</th>
                  <th className="text-left py-2 px-2">Stock</th>
                  <th className="text-left py-2 px-2">Weight (g)</th>
                </tr>
              </thead>
              <tbody>
                {variantFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="py-2 px-2">
                      <FormField
                        control={control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => <Input {...field} className="w-28" />}
                      />
                    </td>
                    {watchedOptions
                      ?.filter(o => o.name)
                      .map(opt => (
                        <td key={opt.name} className="py-2 px-2 text-muted-foreground">
                          {(getValues(`variants.${index}.options`) as Record<string, string>)?.[
                            opt.name
                          ] || '-'}
                        </td>
                      ))}
                    <td className="py-2 px-2">
                      <FormField
                        control={control}
                        name={`variants.${index}.priceEUR`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-20"
                            placeholder="0.00"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <FormField
                        control={control}
                        name={`variants.${index}.priceUSD`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-20"
                            placeholder="0.00"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <FormField
                        control={control}
                        name={`variants.${index}.stock`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="w-16"
                            placeholder="0"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <FormField
                        control={control}
                        name={`variants.${index}.weight`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="w-16"
                            placeholder="0"
                          />
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {children}
    </form>
  )
}

export { ProductForm }
