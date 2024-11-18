import { MetadataRoute } from 'next'
import { connectMongoose } from '@/utils/mongoose'
import BarometerType, { type IBarometerType } from '@/models/type'
import Barometer, { type IBarometer } from '@/models/barometer'
import { slug as slugify } from '@/utils/misc'
import { barometerRoute, barometerTypesRoute } from './constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
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

async function getItemPages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  await connectMongoose()
  const barometers: IBarometer[] = await Barometer.find()
  return barometers.map(({ slug, name }) => ({
    url: baseUrl + barometerRoute + (slug ?? slugify(name)),
    priority: 0.8,
    lastModified: new Date(),
  }))
}
async function getCategoryPages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  await connectMongoose()
  const categories: IBarometerType[] = await BarometerType.find()
  return categories.map(({ name }) => ({
    url: baseUrl + barometerTypesRoute + name.toLowerCase(),
    priority: 0.9,
    lastModified: new Date(),
  }))
}
