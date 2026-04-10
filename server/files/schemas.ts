import { z } from 'zod'

export const mediaFileSchema = z.object({ url: z.string().min(1), name: z.string().min(1) })
