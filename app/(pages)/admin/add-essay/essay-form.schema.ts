import { EssayTopic } from '@prisma/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'
import { mediaFileSchema } from '@/server/files/schemas'

dayjs.extend(utc)

/** Rubric topics, in display order. Labels match the enum values. */
export const ESSAY_TOPICS = Object.values(EssayTopic)

/**
 * Form-level validation (strings as they live in the inputs).
 * The date is a `YYYY-MM-DD` string; it becomes a `Date` in the action payload.
 */
export const EssayFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must be under 300 characters'),
  standfirst: z
    .string()
    .min(1, 'Standfirst is required')
    .max(300, 'Standfirst must be under 300 characters'),
  topic: z.enum(EssayTopic),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine(value => dayjs(value).isValid(), { message: 'Must be a valid date' })
    .refine(value => dayjs(value).isBefore(dayjs(), 'day') || dayjs(value).isSame(dayjs(), 'day'), {
      message: 'Date cannot be in the future',
    }),
  pdfFiles: z.array(mediaFileSchema).length(1, 'A PDF file is required'),
})

export type EssayFormData = z.infer<typeof EssayFormSchema>

/** Convert validated form values into the shape the server actions expect. */
export function toEssayActionPayload(values: EssayFormData) {
  return {
    title: values.title.trim(),
    standfirst: values.standfirst.trim(),
    topic: values.topic,
    date: dayjs.utc(values.date).toDate(),
    pdfFiles: values.pdfFiles,
  }
}
