import { Metadata } from 'next'
import { Collection, WithContext } from 'schema-dts'
import { email, github, instagram } from './constants'

export const title = 'Barometers Realm'
export const description =
  'A collection of unique weather instruments spanning the late 18th century to the mid-20th century, with a focus on mercury and aneroid barometers, showcasing the craftsmanship traditions of past masters.'
export const url = process.env.NEXT_PUBLIC_BASE_URL!
export const keywords = [
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
export const images: { url: string; alt: string }[] = [
  {
    url: '/images/categories/aneroid.png',
    alt: 'Aneroid barometers',
  },
  {
    url: '/images/categories/bourdon.png',
    alt: 'Bourdon barometers',
  },
  {
    url: '/images/categories/forecasting.png',
    alt: 'Weather forecasters',
  },
  {
    url: '/images/categories/mercury.png',
    alt: 'Quicksilver barometers',
  },
  {
    url: '/images/categories/pocket.png',
    alt: 'Pocket barometers',
  },
  {
    url: '/images/categories/recorders.png',
    alt: 'Weather indicators and recorders',
  },
]
export const openGraph = {
  title,
  siteName: title,
  description,
  url,
  emails: email,
  images,
  type: 'website',
  locale: 'en_US',
}
export const twitter = {
  card: 'summary_large_image',
  title,
  description,
  images,
}
export const jsonLd: WithContext<Collection> = {
  '@context': 'https://schema.org',
  '@type': 'Collection',
  name: title,
  description,
  url,
  author: {
    '@type': 'Person',
    email,
    name: 'Leo Shirokov',
  },
  image: `${url}/images/categories/aneroid.png`,
}
export const meta: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  keywords,
  authors: [
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
