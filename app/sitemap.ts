import { MetadataRoute } from 'next'
import {
  aboutRoute,
  barometerRoute,
  brandsRoute,
  categoriesRoute,
  historyRoute,
  termsRoute,
} from '@/utils/routes-front'
import { withPrisma } from '@/prisma/prismaClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  return [
    {
      url: `${baseUrl}/`,
      priority: 1,
      lastModified: new Date(),
      changeFrequency: 'daily',
    },
    ...(await getCategoryPages(baseUrl)),
    {
      url: baseUrl + aboutRoute,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: baseUrl + historyRoute,
      lastModified: new Date(),
      priority: 0.9,
    },
    ...(await getItemPages(baseUrl)),
    ...(await getBrandPages(baseUrl)),
    {
      url: baseUrl + termsRoute,
      priority: 0.3,
      lastModified: new Date(),
    },
  ]
}
export const getItemPages = withPrisma(
  async (prisma, baseUrl: string): Promise<MetadataRoute.Sitemap> => {
    const barometers = await prisma.barometer.findMany({ select: { slug: true } })
    return barometers.map(({ slug }) => ({
      url: baseUrl + barometerRoute + slug,
      priority: 0.8,
      lastModified: new Date(),
    }))
  },
)
export const getCategoryPages = withPrisma(
  async (prisma, baseUrl: string): Promise<MetadataRoute.Sitemap> => {
    const categories = await prisma.category.findMany({ select: { name: true } })
    return categories.map(({ name }) => ({
      url: baseUrl + categoriesRoute + name,
      priority: 0.9,
      lastModified: new Date(),
    }))
  },
)
export const getBrandPages = withPrisma(async (prisma, baseUrl: string) => {
  const brands = await prisma.manufacturer.findMany({ select: { slug: true } })
  return brands.map(({ slug }) => ({
    url: baseUrl + brandsRoute + slug,
    priority: 0.8,
    lastModified: new Date(),
  }))
})
