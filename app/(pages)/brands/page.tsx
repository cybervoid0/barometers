import 'server-only'

import { Factory, Globe, MapPin, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Image, IsAdmin } from '@/components/elements'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Route } from '@/constants/routes'
import {
  type AllBrandsDTO,
  type BrandsByCountryDTO,
  getAllBrands,
  getBrandsByCountry,
} from '@/server/brands/queries'
import { type CountryListDTO, getCountries } from '@/server/counties/queries'
import { title } from '../../../constants/metadata'
import type { DynamicOptions } from '../../../types'
import { BrandEdit } from './brand-edit'

export const dynamic: DynamicOptions = 'auto'

export const metadata: Metadata = {
  title: `${title} - Manufacturers`,
}

const BrandByCountry = ({
  country,
  countries,
  allBrands,
}: {
  country: BrandsByCountryDTO[number]
  countries: CountryListDTO
  allBrands: AllBrandsDTO
}) => {
  const manufacturerCount = country.manufacturers.length

  return (
    <Card id={country.code?.toLowerCase() ?? undefined} className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{country.flag || '🏭'}</span>
          <div>
            <CardTitle className="text-lg">{country.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Factory className="w-3 h-3" />
              {manufacturerCount} manufacturer{manufacturerCount !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {country.manufacturers.map(brand => {
            const { id, firstName, name, slug, icon } = brand
            return (
              <div key={id} className="flex items-center gap-2 group">
                <IsAdmin>
                  <BrandEdit brand={brand} countries={countries} brands={allBrands} />
                </IsAdmin>

                <Link className="flex-1 no-underline" href={Route.Brands + slug}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-background border rounded-md">
                      {icon ? (
                        <Image
                          unoptimized
                          width={32}
                          height={32}
                          alt={name}
                          loading="lazy"
                          src={icon}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <Factory className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm capitalize group-hover:text-primary transition-colors">
                        {name + (firstName ? `, ${firstName}` : '')}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function Brands() {
  const [brandsByCountry, countries, allBrands] = await Promise.all([
    getBrandsByCountry(),
    getCountries(),
    getAllBrands(),
  ])

  const totalManufacturers = allBrands.length
  const totalCountries = brandsByCountry.length

  return (
    <article className="mt-6 space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-6">
          <Factory className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-3xl text-secondary tracking-tight">Manufacturers</h2>
            <p className="text-lg text-muted-foreground">
              Master craftsmen and renowned barometer makers / retailers
            </p>
          </div>
        </div>

        {/* Countries Table */}
        <Card className="mb-0">
          <CardHeader>
            <div className="flex items-center justify-between gap-0">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>All Regions</CardTitle>
                </div>
                <CardDescription>Browse manufacturers by country</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-bold text-lg">{totalManufacturers}</div>
                    <div className="text-xs text-muted-foreground">Manufacturers</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-bold text-lg">{totalCountries}</div>
                    <div className="text-xs text-muted-foreground">Countries</div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1.5 gap-x-3">
              {brandsByCountry.map(country => (
                <a
                  key={country.id}
                  href={`#${country.code?.toLowerCase()}`}
                  className="group flex items-center justify-between py-0.5 px-2 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 no-underline"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xl flex-shrink-0">{country.flag || '🏭'}</span>
                    <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {country.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    <span className="text-background">{country._count.manufacturers}</span>
                  </Badge>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </header>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandsByCountry.map(country => (
          <BrandByCountry
            allBrands={allBrands}
            key={country.id}
            country={country}
            countries={countries}
          />
        ))}
      </div>
    </article>
  )
}
