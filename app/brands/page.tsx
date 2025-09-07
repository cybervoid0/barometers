import 'server-only'

import { ArrowUp } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FrontRoutes } from '@/constants/routes-front'
import { withPrisma } from '@/prisma/prismaClient'
import { title } from '../../constants/metadata'
import type { DynamicOptions } from '../../types'

export const dynamic: DynamicOptions = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const getBrandsByCountry = withPrisma(async prisma => {
  return prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      manufacturers: {
        some: {},
      },
    },
    include: {
      manufacturers: {
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          firstName: true,
          name: true,
          slug: true,
          barometers: {
            select: {
              images: {
                where: {
                  order: 0,
                },
                select: {
                  url: true,
                  blurData: true,
                },
                take: 1,
              },
            },
            take: 1,
          },
          icon: true,
        },
      },
    },
  })
})

const BrandsOfCountry = ({
  country,
}: {
  country: Awaited<ReturnType<typeof getBrandsByCountry>>[number]
}) => {
  const width = 32
  return (
    <article className="mr-4 mb-5">
      <h3 className="mb-3 px-5 text-xl font-semibold">{country.name}</h3>
      <Separator className="mx-2 mb-5" />

      <div className="flex flex-col gap-4">
        {country.manufacturers.map(({ id, firstName, name, slug, icon }) => {
          const base64 = icon ? Buffer.from(icon).toString('base64') : null
          const image = base64 ? `data:image/png;base64,${base64}` : null
          return (
            <Link
              className="w-fit no-underline hover:underline"
              key={id}
              href={FrontRoutes.Brands + slug}
            >
              <div className="flex flex-nowrap items-center gap-3">
                {image ? (
                  <Image
                    unoptimized
                    width={width}
                    height={width}
                    alt={name}
                    loading="lazy"
                    src={image}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <ArrowUp size={32} />
                )}
                <p className="w-fit font-medium capitalize">
                  {name + (firstName ? `, ${firstName}` : '')}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </article>
  )
}

export default async function Manufacturers() {
  const countries = await getBrandsByCountry()
  const firstColStates = ['France', 'Great Britain']
  const firstColumn = countries.filter(({ name }) => firstColStates.includes(name))
  const secondColumn = countries.filter(({ name }) => !firstColStates.includes(name))
  return (
    <div className="pt-6">
      <h2 className="mb-4">Manufacturers</h2>
      <p className="mb-6 indent-8">
        Discover the master craftsmen, renowned manufacturers and distinguished sellers behind these
        exceptional barometers, each reflecting timeless artistry and precision. Here is a curated
        list of barometer makers, along with detailed descriptions and iconic works by each master
        from the collection, representing the finest traditions of craftsmanship.
      </p>
      <Card className="xs:p-4 p-4 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-6">
          <div>
            {firstColumn.map(country => (
              <BrandsOfCountry key={country.id} country={country} />
            ))}
          </div>
          <Separator orientation="vertical" className="hidden sm:block" />
          <div>
            {secondColumn.map(country => (
              <BrandsOfCountry key={country.id} country={country} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
