import type { MetadataRoute } from 'next'
import { Route } from '@/constants/routes'
import { prisma } from '@/prisma/prismaClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL environmental var should be set')
  const now = new Date()
  return [
    {
      url: baseUrl + Route.Home,
      priority: 1,
      lastModified: now,
      changeFrequency: 'daily',
    },
    ...(await getCategoryPages(baseUrl, now)),
    {
      url: baseUrl + Route.About,
      lastModified: now,
      priority: 0.9,
    },
    {
      url: baseUrl + Route.History,
      lastModified: now,
      priority: 0.9,
    },
    {
      url: baseUrl + Route.Foundation,
      lastModified: now,
      priority: 0.9,
    },
    {
      url: baseUrl + Route.Donate,
      priority: 1,
      lastModified: now,
    },
    ...(await getItemPages(baseUrl, now)),
    ...(await getBrandPages(baseUrl, now)),
    {
      url: baseUrl + Route.Terms,
      priority: 0.3,
      lastModified: now,
    },
  ]
}

async function getItemPages(baseUrl: string, now: Date): Promise<MetadataRoute.Sitemap> {
  const barometers = await prisma.barometer.findMany({ select: { slug: true } })
  return barometers.map(({ slug }) => ({
    url: baseUrl + Route.Barometer + slug,
    priority: 0.8,
    lastModified: now,
  }))
}

async function getCategoryPages(baseUrl: string, now: Date): Promise<MetadataRoute.Sitemap> {
  const categories = await prisma.category.findMany({ select: { name: true } })
  return categories.map(({ name }) => ({
    url: baseUrl + Route.Categories + name,
    priority: 0.9,
    lastModified: now,
  }))
}

async function getBrandPages(baseUrl: string, now: Date): Promise<MetadataRoute.Sitemap> {
  const brands = await prisma.manufacturer.findMany({ select: { slug: true } })
  return brands.map(({ slug }) => ({
    url: baseUrl + Route.Brands + slug,
    priority: 0.8,
    lastModified: now,
  }))
}
