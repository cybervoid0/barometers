import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'
import type { updateDocument } from '@/server/documents/actions'
import { createImagesInDb } from '@/server/files/images'
import { ImageType } from '@/types'

dayjs.extend(utc)

/**
 * Validation schema for document edit form
 */
export const DocumentEditSchema = z.object({
  id: z.string(),
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
        if (!value) return true
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
  annotations: z.string(),
  provenance: z.string(),
  acquisitionDate: z
    .string()
    .refine(
      value => {
        if (!value) return true
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

export type DocumentEditForm = z.infer<typeof DocumentEditSchema>

/**
 * Transform schema - converts form data to Prisma update format
 */
export const DocumentEditTransformSchema = DocumentEditSchema.transform(
  async ({
    images,
    relatedBarometers,
    date,
    acquisitionDate,
    annotations,
    ...values
  }): Promise<Parameters<typeof updateDocument>[0]> => {
    return {
      ...values,
      date: date ? dayjs.utc(date).toDate() : null,
      acquisitionDate: acquisitionDate ? dayjs.utc(acquisitionDate).toDate() : null,
      annotations: annotations
        ? annotations
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
      images: {
        set: [],
        connect:
          images.length > 0
            ? await createImagesInDb(images, ImageType.Document, values.catalogueNumber)
            : [],
      },
      relatedBarometers: {
        set: relatedBarometers.map(id => ({ id })),
      },
    }
  },
)
