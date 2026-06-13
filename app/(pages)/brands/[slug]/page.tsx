import 'server-only'

import { BookText } from 'lucide-react'
import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'
import { BarometerCardWithIcon, ImageLightbox, ShowMore } from '@/components/elements'
import { Card, Separator } from '@/components/ui'
import { fileStorage, isRouteKey, Route, Tag } from '@/constants'
import { title } from '@/constants/metadata'
import { prisma } from '@/prisma/prismaClient'
import { type BrandDTO, getBrand } from '@/server/brands/queries'

interface Props {
  params: Promise<{
    slug: string
  }>
}

async function getBarometersByManufacturer(slug: string) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.barometers)
  const barometers = await prisma.barometer.findMany({
    where: { manufacturer: { slug } },
    select: {
      id: true,
      name: true,
      slug: true,
      category: {
        select: {
          name: true,
          label: true,
        },
      },
      images: {
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          url: true,
          blurData: true,
          name: true,
          order: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
  return barometers.map(barometer => {
    const { label } = barometer.category
    if (!isRouteKey(label)) throw new Error(`A category ${label} doesn't exist in the app`)
    return {
      ...barometer,
      category: {
        ...barometer.category,
        label,
        link: Route[label],
      },
    }
  })
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const manufacturer = await getBrand(slug)
  if (!manufacturer) notFound()
  return {
    title: `${title} - Manufacturer: ${manufacturer.name}`,
  }
}

async function getBrandSlugs() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.brands)
  return prisma.manufacturer.findMany({
    select: { slug: true },
  })
}

export async function generateStaticParams() {
  return getBrandSlugs()
}

export default async function Manufacturer(props: Props) {
  const { slug } = await props.params
  const manufacturer = await getBrand(slug)
  if (!manufacturer) notFound()
  const barometers = await getBarometersByManufacturer(slug)
  const fullName = `${manufacturer.firstName ?? ''} ${manufacturer.name}`
  const pdfs = manufacturer.pdfFiles ?? []
  return (
    <>
      <div className="mt-6 mb-8">
        <h2 className="text-secondary">{fullName}</h2>
        <Connections label="Successor" brands={manufacturer.successors} />
        <Connections label="Predecessor" brands={manufacturer.predecessors} />
      </div>
      {manufacturer.images.length > 0 && (
        <div className="mb-8 flex flex-col items-center gap-5 sm:flex-row">
          {manufacturer.images.map(image => (
            <ImageLightbox src={image.url} name={image.name} key={image.id} />
          ))}
        </div>
      )}
      {manufacturer.description && (
        <ShowMore md maxHeight={400} className="mb-10 mx-auto max-w-5xl">
          {manufacturer.description}
        </ShowMore>
      )}
      {pdfs.length > 0 && (
        <>
          <Separator />
          <div className="mb-8 mt-8">
            <h3 className="mb-3 text-secondary">PDF files</h3>
            <ul className="space-y-2">
              {pdfs.map(({ id, name, url }) => (
                <li key={id}>
                  <a
                    className="flex gap-2 items-center w-fit"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={fileStorage + url}
                  >
                    <BookText size={14} className="text-red-900" />
                    <p>{name}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {barometers.length > 0 && (
        <Card className="p-4 shadow-md">
          <h3 className="text-secondary">{`Instruments by ${fullName} in the collection`}</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {barometers.map(({ name, id, images, slug: barometerSlug, category }) => (
              <div key={id}>
                <BarometerCardWithIcon
                  barometerName={name}
                  barometerLink={Route.Barometer + barometerSlug}
                  categoryLink={category.link}
                  categoryName={category.name}
                  image={images[0]}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}

/**
 * The Connections component displays a list of related manufacturers (e.g., successors or predecessors) with a label.
 * If the list is empty, the component renders nothing.
 */
const Connections = ({ brands, label }: { label: string; brands: BrandDTO['successors'] }) =>
  brands.length > 0 && (
    <div>
      <span className="text-xl font-medium">{`${label}${brands.length > 1 ? 's' : ''}: `}</span>
      {brands.map(({ id, name, firstName, slug }, i, arr) => (
        <Fragment key={id}>
          <Link href={Route.Brands + slug} className="underline">
            {firstName} {name}
          </Link>
          {i < arr.length - 1 && `, `}
        </Fragment>
      ))}
    </div>
  )
