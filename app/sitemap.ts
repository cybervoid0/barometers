import { MetadataRoute } from 'next'
import { slug as slugify } from '@/utils/misc'
import { barometerRoute, categoriesRoute } from './constants'
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
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: new Date(),
      priority: 0.9,
    },
    ...(await getItemPages(baseUrl)),
    {
      url: `${baseUrl}/terms-and-conditions`,
      priority: 0.3,
      lastModified: new Date(),
    },
  ]
}
/* eslint-disable prettier/prettier */
export const getItemPages = withPrisma(
  async (prisma, baseUrl: string): Promise<MetadataRoute.Sitemap> => {
    const barometers = await prisma.barometer.findMany({ select: { slug: true, name: true } })
    return barometers.map(({ slug, name }) => ({
      url: baseUrl + barometerRoute + (slug ?? slugify(name)),
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
