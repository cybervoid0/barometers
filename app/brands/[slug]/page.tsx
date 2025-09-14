import 'server-only'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { BarometerCardWithIcon, ImageLightbox, MD } from '@/components/elements'
import { Card } from '@/components/ui'
import { FrontRoutes } from '@/constants'
import { title } from '@/constants/metadata'
import { withPrisma } from '@/prisma/prismaClient'
import { type BrandDTO, getBrand } from '@/server/brands/queries'
import type { DynamicOptions } from '@/types'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export const dynamic: DynamicOptions = 'force-static'

const getBarometersByManufacturer = withPrisma(async (prisma, slug: string) =>
  prisma.barometer.findMany({
    where: { manufacturer: { slug } },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: { name: 'asc' },
  }),
)

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const manufacturer = await getBrand(slug)
  return {
    title: `${title} - Manufacturer: ${manufacturer.name}`,
  }
}

export const generateStaticParams = withPrisma(async prisma =>
  prisma.manufacturer.findMany({
    select: { slug: true },
  }),
)

export default async function Manufacturer(props: Props) {
  const { slug } = await props.params
  const manufacturer = await getBrand(slug)
  const barometers = await getBarometersByManufacturer(slug)
  const fullName = `${manufacturer.firstName ?? ''} ${manufacturer.name}`
  return (
    <>
      <div className="mt-6 mb-4">
        <h2>{fullName}</h2>
        <Connections label="Successor" brands={manufacturer.successors} />
        <Connections label="Predecessor" brands={manufacturer.predecessors} />
      </div>
      <div className="my-8 flex flex-col items-center gap-8 sm:flex-row">
        {manufacturer.images.map(image => (
          <ImageLightbox src={image.url} name={image.name} key={image.id} />
        ))}
      </div>
      <MD className="my-8">{manufacturer.description}</MD>
      {barometers.length > 0 && (
        <Card className="p-4 shadow-md">
          <h3>{`Instruments by ${fullName} in the collection`}</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {barometers.map(({ name, id, images, slug: barometerSlug, category }) => (
              <div key={id}>
                <BarometerCardWithIcon
                  barometerName={name}
                  barometerLink={FrontRoutes.Barometer + barometerSlug}
                  categoryLink={FrontRoutes.Categories + category.name}
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
          <Link href={FrontRoutes.Brands + slug} className="underline">
            {firstName} {name}
          </Link>
          {i < arr.length - 1 && `, `}
        </Fragment>
      ))}
    </div>
  )
