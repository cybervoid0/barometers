import { z } from 'zod'

export const CreateMovementSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const UpdateMovementSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const DeleteMovementSchema = z.object({
  id: z.number().int().positive(),
})
