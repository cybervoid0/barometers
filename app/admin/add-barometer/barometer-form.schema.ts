import type { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'
import { imageStorage } from '@/constants/globals'
import { saveTempImage } from '@/server/images/actions'
import { ImageType } from '@/types'
import { getThumbnailBase64, slug } from '@/utils'

dayjs.extend(utc)

/**
 * Validation schema for react-hook-form - NO transformations!
 * This keeps original form types (strings, arrays, etc.)
 */
export const BarometerFormValidationSchema = z.object({
  // Required fields - just validation
  collectionId: z
    .string()
    .min(1, 'Catalogue No. is required')
    .max(100, 'Catalogue No. must be less than 100 characters'),

  name: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),

  categoryId: z.string().min(1, 'Category is required'),

  date: z
    .string()
    .min(1, 'Year is required')
    .regex(/^\d{4}$/, 'Year must be 4 digits'),

  dateDescription: z.string().min(1, 'Date description is required'),
  manufacturerId: z.string().min(1, 'Manufacturer is required'),
  conditionId: z.string().min(1, 'Condition is required'),

  // Optional fields
  serial: z.string().max(100, 'Serial number must be less than 100 characters').optional(),

  description: z.string().optional(),

  estimatedPrice: z
    .string()
    .refine(val => {
      if (!val || val === '') return true
      const num = parseFloat(val)
      return !Number.isNaN(num) && num > 0
    }, 'Must be a positive number')
    .optional(),

  purchasedAt: z
    .string()
    .refine(val => {
      if (!val || val === '') return true
      return dayjs(val).isValid()
    }, 'Must be a valid date')
    .refine(val => {
      if (!val || val === '') return true
      return dayjs(val).isBefore(dayjs(), 'day') || dayjs(val).isSame(dayjs(), 'day')
    }, 'Purchase date cannot be in the future')
    .optional(),

  subCategoryId: z.string().optional(),

  // Array fields
  dimensions: z
    .array(
      z.object({
        dim: z.string(),
        value: z.string(),
      }),
    )
    .optional(),

  materials: z.array(z.number().int()).optional(),

  images: z.array(z.string()).nonempty('At least one image is required'),
})

/**
 * Transformation schema - converts form data to Prisma format
 * This does ALL the transformations and type conversions!
 */
export const BarometerFormTransformSchema = BarometerFormValidationSchema.transform(
  async (formData): Promise<Prisma.BarometerUncheckedCreateInput> => ({
    // Direct mappings
    ...formData,

    // Generated fields
    slug: slug(formData.name),

    // Transformed fields
    description: formData.description || '',
    serial: formData.serial || null,
    date: dayjs(`${formData.date}-01-01`).toDate(),
    estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
    purchasedAt: formData.purchasedAt ? dayjs(formData.purchasedAt).toDate() : null,
    dimensions:
      formData.dimensions && formData.dimensions.length > 0 ? formData.dimensions : undefined,

    // Optional subcategory
    subCategoryId:
      formData.subCategoryId && formData.subCategoryId !== '' && formData.subCategoryId !== 'none'
        ? parseInt(formData.subCategoryId, 10)
        : null,

    // Materials relation
    materials:
      formData.materials && formData.materials.length > 0
        ? {
            connect: formData.materials.map(id => ({ id })),
          }
        : undefined,

    // Images relation - with async processing
    images:
      formData.images.length > 0
        ? {
            create: await Promise.all(
              formData.images.map(async (url, i) => {
                const newUrl = await saveTempImage(url, ImageType.Barometer, formData.collectionId)
                return {
                  url: newUrl,
                  order: i,
                  name: formData.name,
                  // ! это будет долго качать уже загруженные фотки. изменить алгоритм
                  // хорошо бы чтобы в форме были сами файлы чтобы не качать картинки
                  blurData: await getThumbnailBase64(imageStorage + newUrl),
                }
              }),
            ),
          }
        : undefined,
  }),
)

// Export types
export type BarometerFormData = z.infer<typeof BarometerFormValidationSchema>
