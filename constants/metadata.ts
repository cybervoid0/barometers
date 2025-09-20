import type { Metadata } from 'next'
import type { Collection, WithContext } from 'schema-dts'
import { email, foundation, github, instagram } from '@/constants/globals'

export const title = 'Barometers Realm'
export const description =
  'Art of Weather Instruments Foundation presents a collection of unique weather instruments spanning the late 18th century to the mid-20th century, with a focus on mercury and aneroid barometers, showcasing the craftsmanship traditions of past masters.'
export const url = process.env.NEXT_PUBLIC_BASE_URL ?? ''
export const keywords = [
  'AWIF',
  'Art of Weather Instruments Foundation',
  'foundation',
  'barometer',
  'barometers',
  'antique',
  'collector',
  'collection',
  'history of science',
  'auction',
  'aneroid',
  'mercury',
  'quicksilver',
  'forecaster',
  'weather',
  'atmosphere',
  'pressure',
  'wood',
  'mahogany',
  'brass',
  'temperature',
  'porcelain',
  'glass',
  'breguet',
  'vickery',
  'Fitzroy',
  'chart',
  'wheel',
  'drum',
  'movement',
  'barograph',
  'silver',
  'bezel',
  'hand',
  'moon',
  'feathering',
  'storm',
  'glass',
  'sympiesometer',
  'thermograph',
  'hygrograph',
  'rack-and-pinion',
  'gear',
  'link',
  'vidie',
  'marine',
]

export const openGraph = {
  title,
  siteName: title,
  description,
  url,
  emails: email,
  type: 'website',
  locale: 'en_US',
}
export const twitter = {
  card: 'summary_large_image',
  title,
  description,
}
export const jsonLd: WithContext<Collection> = {
  '@context': 'https://schema.org',
  '@type': 'Collection',
  name: title,
  description,
  url,
  author: {
    '@type': 'Organization',
    email,
    name: foundation.tradeName,
    url,
    legalName: foundation.fullName,
    address: foundation.postAddress,
    brand: foundation.shortName,
  },
}
export const meta: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  keywords,
  authors: [
    {
      name: foundation.tradeName,
      url,
    },
    {
      name: 'Leo Shirokov',
      url: instagram,
    },
    {
      name: 'Alex Shenshin',
      url: github,
    },
  ],
  openGraph,
  twitter,
}
