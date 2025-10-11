import capitalize from 'lodash/capitalize'
import type { Metadata } from 'next/types'
import type { PropsWithChildren } from 'react'
import { imageStorage } from '@/constants/globals'
import { keywords, openGraph, title, twitter } from '@/constants/metadata'
import { Route } from '@/constants/routes'
import { getBarometer } from '@/server/barometers/queries'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  try {
    const barometer = await getBarometer(slug)
    if (!barometer) throw new Error()
    const { description, name, images } = barometer
    const barometerTitle = `${title}: ${capitalize(name)}`
    const [image] = images

    // create full image URL
    // todo: load processed (scaled) image
    const imageUrl = image ? `${imageStorage}${image.url}` : undefined
    const imageData = imageUrl
      ? {
          url: imageUrl,
          alt: `${name} barometer`,
        }
      : undefined

    const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${Route.Barometer}${slug}`

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
  } catch (_error) {
    return {
      title: `${title}: Barometer not found`,
      description: 'This barometer could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export default function CollectionItemLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
