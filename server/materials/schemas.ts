import { z } from 'zod'

export const CreateMaterialSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const UpdateMaterialSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const DeleteMaterialSchema = z.object({
  id: z.number().int().positive(),
})
