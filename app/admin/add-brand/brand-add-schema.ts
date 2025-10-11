import { z } from 'zod'
import { createImagesInDb, saveTempImage } from '@/server/images/actions'
import { ImageType } from '@/types'
import { getBrandSlug } from '@/utils'

// Zod validation schema
const brandSchema = z.object({
  firstName: z.string().trim().max(100, 'First name should be shorter than 100 characters'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name should be longer than 2 characters')
    .max(100, 'Name should be shorter than 100 characters'),
  slug: z.string().optional(),
  city: z.string().max(100, 'City should be shorter than 100 characters'),
  countries: z.array(z.number().int()).min(1, 'At least one country must be selected'),
  url: z.url('URL should be valid internet domain').or(z.literal('')),
  description: z.string(),
  successors: z.array(z.string()),
  images: z.array(z.string()),
  icon: z.string().nullable(),
})

type BrandFormData = z.infer<typeof brandSchema>

const brandTransformSchema = brandSchema.transform(
  async ({ countries, successors, images, ...formData }) => {
    const slug = getBrandSlug(formData.name, formData.firstName)
    return {
      ...formData,
      slug,
      countries: {
        connect: countries.map(id => ({ id })),
      },
      successors: {
        connect: successors.map(id => ({ id })),
      },
      images:
        images.length > 0
          ? {
              connect: await createImagesInDb(
                await Promise.all(images.map(url => saveTempImage(url, ImageType.Brand, slug))),
                formData.name,
              ),
            }
          : undefined,
    }
  },
)

export { type BrandFormData, brandSchema, brandTransformSchema }
