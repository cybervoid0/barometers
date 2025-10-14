import { z } from 'zod'
import type { updateBrand } from '@/server/brands/actions'
import { createImagesInDb } from '@/server/files/images'
import { savePdfs } from '@/server/files/pdfs'
import { ImageType } from '@/types'
import { getBrandSlug } from '@/utils'

// Schema for form validation (input)
export const BrandEditSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name should be longer than 2 symbols')
    .max(100, 'Name should be shorter than 100 symbols'),
  firstName: z.string().max(100, 'Name should be shorter than 100 symbols'),
  city: z.string().max(100, 'City should be shorter than 100 symbols'),
  countries: z.array(z.number().int()).min(1, 'At least one country must be selected'),
  url: z.url('URL should be valid internet domain').or(z.literal('')),
  description: z.string().optional(),
  successors: z.array(z.string()),
  images: z.array(
    z.object({
      url: z.string().min(1, 'URL is required'),
      name: z.string(),
    }),
  ),
  icon: z.string().nullable(),
  pdfFiles: z.array(
    z.object({
      url: z.string().min(1, 'PDF file must have a URL'),
      name: z.string().min(1, 'PDF file must have a name'),
    }),
  ),
})

export type BrandEditForm = z.infer<typeof BrandEditSchema>

export const BrandEditTransformSchema = BrandEditSchema.transform(
  async ({
    images,
    successors,
    countries,
    pdfFiles,
    ...values
  }): Promise<Parameters<typeof updateBrand>[0]> => {
    const slug = getBrandSlug(values.name, values.firstName)

    return {
      ...values,
      slug,
      images: {
        deleteMany: {},
        connect: await createImagesInDb(images, ImageType.Brand, slug),
      },
      successors: {
        set: successors.map(id => ({ id })),
      },
      countries: {
        set: countries.map(id => ({ id })),
      },
      pdfFiles: {
        deleteMany: {},
        create: await savePdfs(pdfFiles),
      },
    }
  },
)
