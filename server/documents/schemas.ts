import { z } from 'zod'
import { mediaFileSchema } from '@/server/files/schemas'

const prismaConnect = z.object({ id: z.string() })

export const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  catalogueNumber: z.string().min(1).max(100),
  documentType: z.string().min(1).max(100),
  subject: z.string().max(200),
  creator: z.string().max(200),
  date: z.date().nullable().optional(),
  dateDescription: z.string().max(200),
  placeOfOrigin: z.string().max(200),
  language: z.string().max(100),
  physicalDescription: z.string(),
  annotations: z.array(z.string()),
  provenance: z.string(),
  acquisitionDate: z.date().nullable().optional(),
  description: z.string(),
  conditionId: z.string(),
  // temp upload refs; persisted server-side in createDocument
  images: z.array(mediaFileSchema).optional(),
  relatedBarometers: z.object({ connect: z.array(prismaConnect) }).optional(),
})

export const UpdateDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  catalogueNumber: z.string().min(1).max(100).optional(),
  documentType: z.string().min(1).max(100).optional(),
  subject: z.string().max(200).optional(),
  creator: z.string().max(200).optional(),
  date: z.date().nullable().optional(),
  dateDescription: z.string().max(200).optional(),
  placeOfOrigin: z.string().max(200).optional(),
  language: z.string().max(100).optional(),
  physicalDescription: z.string().optional(),
  annotations: z.array(z.string()).optional(),
  provenance: z.string().optional(),
  acquisitionDate: z.date().nullable().optional(),
  description: z.string().optional(),
  conditionId: z.string().optional(),
  // temp upload refs (full desired set); replaces existing images server-side in updateDocument
  images: z.array(mediaFileSchema).optional(),
  relatedBarometers: z.object({ set: z.array(prismaConnect) }).optional(),
})
