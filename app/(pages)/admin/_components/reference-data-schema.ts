import { z } from 'zod'
import type { ActionResult } from '@/types'

export const referenceDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export type ReferenceDataForm = z.infer<typeof referenceDataSchema>

export type ReferenceDataItem = { id: number; name: string; description: string | null }

export interface ReferenceDataActions {
  onCreate: (data: {
    name: string
    description?: string
  }) => Promise<ActionResult<{ id: number; name: string }>>
  onUpdate: (data: {
    id: number
    name: string
    description?: string
  }) => Promise<ActionResult<{ id: number; name: string }>>
  onDelete: (data: { id: number }) => Promise<ActionResult<{ id: number }>>
}
