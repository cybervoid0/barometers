import { z } from 'zod'

const prismaConnect = z.object({ id: z.string() })

export const CreateBarometerSchema = z.object({
  collectionId: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  date: z.date(),
  dateDescription: z.string().min(1),
  manufacturerId: z.string().min(1),
  conditionId: z.string().min(1),
  serial: z.string().max(100).nullable().optional(),
  description: z.string().optional(),
  estimatedPrice: z.number().positive().nullable().optional(),
  purchasedAt: z.date().nullable().optional(),
  subCategoryId: z.number().int().nullable().optional(),
  dimensions: z.array(z.object({ dim: z.string(), value: z.string() })).optional(),
  materials: z.object({ connect: z.array(z.object({ id: z.number().int() })) }).optional(),
  images: z.object({ connect: z.array(prismaConnect) }).optional(),
})

export const UpdateBarometerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  collectionId: z.string().min(1).max(100).optional(),
  slug: z.string().optional(),
  serial: z.string().max(100).nullable().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  conditionId: z.string().min(1).optional(),
  manufacturerId: z.string().min(1).optional(),
  dateDescription: z.string().optional(),
  subCategoryId: z.number().int().nullable().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  purchasedAt: z.union([z.string(), z.date()]).nullable().optional(),
  estimatedPrice: z.number().positive().nullable().optional(),
  dimensions: z.array(z.object({ dim: z.string(), value: z.string() })).optional(),
  materials: z.object({ set: z.array(z.object({ id: z.number().int() })) }).optional(),
  images: z
    .object({
      deleteMany: z.object({}).strict().optional(),
      connect: z.array(prismaConnect).optional(),
    })
    .optional(),
})
