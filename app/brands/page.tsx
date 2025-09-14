import 'server-only'

import { ArrowUp } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { IsAdmin } from '@/components/elements'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FrontRoutes } from '@/constants/routes-front'
import {
  type AllBrandsDTO,
  type BrandsByCountryDTO,
  getAllBrands,
  getBrandsByCountry,
} from '@/server/brands/queries'
import { type CountryListDTO, getCountries } from '@/server/counties/queries'
import { title } from '../../constants/metadata'
import type { DynamicOptions } from '../../types'
import { BrandEdit } from './brand-edit'

export const dynamic: DynamicOptions = 'force-static'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const width = 32
const BrandByCountry = ({
  country,
  countries,
  allBrands,
}: {
  country: BrandsByCountryDTO[number]
  countries: CountryListDTO
  allBrands: AllBrandsDTO
}) => {
  return (
    <article className="mr-4 mb-5">
      <h3 className="mb-3 px-5 text-xl font-semibold">{country.name}</h3>
      <Separator className="mx-2 mb-5" />

      <div className="flex flex-col gap-4">
        {country.manufacturers.map(brand => {
          const { id, firstName, name, slug, icon } = brand
          return (
            <div key={id} className="flex gap-1 items-center">
              <IsAdmin>
                <BrandEdit brand={brand} countries={countries} brands={allBrands} />
              </IsAdmin>
              <Link className="w-fit no-underline hover:underline" href={FrontRoutes.Brands + slug}>
                <div className="flex flex-nowrap items-center gap-3">
                  {icon ? (
                    <Image
                      unoptimized
                      width={width}
                      height={width}
                      alt={name}
                      loading="lazy"
                      src={icon}
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
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default async function Brands() {
  const [brandsByCountry, countries, allBrands] = await Promise.all([
    getBrandsByCountry(),
    getCountries(),
    getAllBrands(),
  ])
  const firstColStates = ['France', 'Great Britain']
  const firstColumn = brandsByCountry.filter(({ name }) => firstColStates.includes(name))
  const secondColumn = brandsByCountry.filter(({ name }) => !firstColStates.includes(name))
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
              <BrandByCountry
                allBrands={allBrands}
                key={country.id}
                country={country}
                countries={countries}
              />
            ))}
          </div>
          <Separator orientation="vertical" className="hidden sm:block" />
          <div>
            {secondColumn.map(country => (
              <BrandByCountry
                allBrands={allBrands}
                key={country.id}
                country={country}
                countries={countries}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
