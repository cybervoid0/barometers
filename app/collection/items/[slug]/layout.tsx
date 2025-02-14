import { Metadata } from 'next/types'
import { ReactNode, PropsWithChildren } from 'react'
import capitalize from 'lodash/capitalize'
import { getBarometer } from '@/app/api/v2/barometers/[slug]/getters'
import { googleStorageImagesFolder } from '@/utils/constants'
import { title, openGraph, twitter } from '@/app/metadata'
import { barometerRoute } from '@/utils/routes-front'

export interface ItemProps extends PropsWithChildren {
  params: { slug: string }
  modal: ReactNode
}

export async function generateMetadata({ params: { slug } }: ItemProps): Promise<Metadata> {
  const { description, name, images } = await getBarometer(slug)
  const barometerTitle = `${title}: ${capitalize(name)}`
  const barometerImages =
    images &&
    images.slice(0, 1).map(image => ({
      url: googleStorageImagesFolder + image.url,
      alt: name,
    }))
  const url = barometerRoute + slug
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

export default function CollectionItemLayout({ children, modal }: ItemProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
