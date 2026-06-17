import { EssayTopic } from '@prisma/client'
import { z } from 'zod'
import { mediaFileSchema } from '@/server/files/schemas'

export const CreateEssaySchema = z.object({
  title: z.string().min(1).max(300),
  standfirst: z.string().min(1).max(300),
  topic: z.enum(EssayTopic),
  date: z.date(),
  // exactly one temp/permanent PDF ref; persisted server-side in createEssay
  pdfFiles: z.array(mediaFileSchema).length(1),
})

export const UpdateEssaySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(300).optional(),
  standfirst: z.string().min(1).max(300).optional(),
  topic: z.enum(EssayTopic).optional(),
  date: z.date().optional(),
  // when provided, replaces the existing PDF; the old storage object is removed
  pdfFiles: z.array(mediaFileSchema).length(1).optional(),
})
