import { Metadata } from 'next/types'
import { PropsWithChildren } from 'react'
import capitalize from 'lodash/capitalize'
import { getBarometer } from '@/app/services'
import { imageStorage } from '@/utils/constants'
import { title, openGraph, twitter } from '@/app/metadata'
import { FrontRoutes } from '@/utils/routes-front'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params

  const { slug } = params

  const { description, name, images } = await getBarometer(slug)
  const barometerTitle = `${title}: ${capitalize(name)}`
  const barometerImages =
    images &&
    images.slice(0, 1).map(image => ({
      url: imageStorage + image.url,
      alt: name,
    }))
  const url = FrontRoutes.Barometer + slug
  return {
    title: barometerTitle,
    description,
    openGraph: {
      ...openGraph,
      title: barometerTitle,
      description,
      url,
      images: barometerImages,
    },
    twitter: {
      ...twitter,
      title: name,
      description,
      images: barometerImages,
    },
  }
}

export default function CollectionItemLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
