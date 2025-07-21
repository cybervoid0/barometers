import { Metadata } from 'next/types'
import { PropsWithChildren } from 'react'
import capitalize from 'lodash/capitalize'
import { getBarometer } from '@/app/services'
import { imageStorage } from '@/utils/constants'
import { title, openGraph, twitter, keywords } from '@/app/metadata'
import { FrontRoutes } from '@/utils/routes-front'

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { description, name, images } = await getBarometer(slug)
  const barometerTitle = `${title}: ${capitalize(name)}`
  const [image] = images

  // create full image URL
  const imageUrl = image ? `${imageStorage}${image.url}` : undefined
  const imageData = imageUrl
    ? {
        url: imageUrl,
        alt: `${name} barometer`,
      }
    : undefined

  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${FrontRoutes.Barometer}${slug}`

  return {
    title: barometerTitle,
    description,
    keywords: [...keywords, name.toLowerCase()],
    openGraph: {
      ...openGraph,
      title: barometerTitle,
      description,
      url: pageUrl,
      images: imageData,
      type: 'article',
    },
    twitter: {
      ...twitter,
      title: barometerTitle,
      description,
      images: imageData,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default function CollectionItemLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
