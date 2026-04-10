import { z } from 'zod'

const prismaConnect = z.object({ id: z.string() })
const prismaConnectInt = z.object({ id: z.number().int() })

export const CreateBrandSchema = z.object({
  firstName: z.string().max(100),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  city: z.string().max(100),
  url: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  countries: z.object({ connect: z.array(prismaConnectInt) }),
  successors: z.object({ connect: z.array(prismaConnect) }),
  images: z.object({ connect: z.array(prismaConnect) }).optional(),
  pdfFiles: z
    .object({
      create: z.array(z.object({ url: z.string().min(1), name: z.string().min(1) })),
    })
    .optional(),
})

export const UpdateBrandSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  slug: z.string().optional(),
  city: z.string().max(100).optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().nullable().optional(),
  countries: z.object({ set: z.array(prismaConnectInt) }).optional(),
  successors: z.object({ set: z.array(prismaConnect) }).optional(),
  images: z
    .object({
      deleteMany: z.object({}).strict().optional(),
      connect: z.array(prismaConnect).optional(),
    })
    .optional(),
  pdfFiles: z
    .object({
      deleteMany: z.object({}).strict().optional(),
      create: z.array(z.object({ url: z.string().min(1), name: z.string().min(1) })).optional(),
    })
    .optional(),
})
