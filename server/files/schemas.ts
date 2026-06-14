import { z } from 'zod'

// `name` may be empty: it derives from a (nullable) DB column on edit and from a
// stripped filename on upload, so it must not block an otherwise-valid resubmit.
export const mediaFileSchema = z.object({ url: z.string().min(1), name: z.string() })
