import type { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'
import { createImagesInDb } from '@/server/files/images'
import { ImageType } from '@/types'

dayjs.extend(utc)

/**
 * Validation schema for react-hook-form - NO transformations!
 * This keeps original form types (strings, arrays, etc.)
 */
export const DocumentFormValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  catalogueNumber: z
    .string()
    .min(1, 'Catalogue Number is required')
    .max(100, 'Catalogue Number must be less than 100 characters'),
  documentType: z
    .string()
    .min(1, 'Document Type is required')
    .max(100, 'Document Type must be less than 100 characters'),
  subject: z.string().max(200, 'Subject must be less than 200 characters'),
  creator: z.string().max(200, 'Creator must be less than 200 characters'),
  date: z
    .string()
    .refine(
      value => {
        if (!value) return true // Allow empty string
        return dayjs(value).isValid()
      },
      { message: 'Must be a valid date' },
    )
    .refine(
      value => {
        if (!value) return true
        return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
      },
      { message: 'Date cannot be in the future' },
    ),
  dateDescription: z.string().max(200, 'Date description must be less than 200 characters'),
  placeOfOrigin: z.string().max(200, 'Place of origin must be less than 200 characters'),
  language: z.string().max(100, 'Language must be less than 100 characters'),
  physicalDescription: z.string(),
  annotations: z.string(), // Will be split into array before sending
  provenance: z.string(),
  acquisitionDate: z
    .string()
    .refine(
      value => {
        if (!value) return true // Allow empty string
        return dayjs(value).isValid()
      },
      { message: 'Must be a valid date' },
    )
    .refine(
      value => {
        if (!value) return true
        return dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day')
      },
      { message: 'Acquisition date cannot be in the future' },
    ),
  description: z.string(),
  conditionId: z.string(),
  images: z.array(
    z.object({
      url: z.string().min(1, 'URL is required'),
      name: z.string(),
    }),
  ),
  relatedBarometers: z.array(z.string()),
})

/**
 * Transformation schema - converts form data to Prisma format
 * This does ALL the transformations and type conversions!
 */
export const DocumentFormTransformSchema = DocumentFormValidationSchema.transform(
  async (values): Promise<Prisma.DocumentUncheckedCreateInput> => {
    const { images, relatedBarometers, date, acquisitionDate, annotations, ...formValues } = values
    return {
      ...formValues,
      date: date ? dayjs.utc(date).toDate() : null,
      acquisitionDate: acquisitionDate ? dayjs.utc(acquisitionDate).toDate() : null,
      annotations: annotations
        ? annotations
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
      images:
        images.length > 0
          ? {
              connect: await createImagesInDb(images, ImageType.Document, values.catalogueNumber),
            }
          : undefined,
      relatedBarometers:
        relatedBarometers.length > 0
          ? { connect: relatedBarometers.map(id => ({ id })) }
          : undefined,
    }
  },
)

// Export types
export type DocumentFormData = z.infer<typeof DocumentFormValidationSchema>
