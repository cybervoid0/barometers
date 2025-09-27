import 'server-only'

import { Factory, Globe, MapPin, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { IsAdmin } from '@/components/elements'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
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

// Country flag emojis mapping
const countryFlags: Record<string, string> = {
  France: '🇫🇷',
  'Great Britain': '🇬🇧',
  Germany: '🇩🇪',
  Belgium: '🇧🇪',
  Netherlands: '🇳🇱',
  Italy: '🇮🇹',
  Switzerland: '🇨🇭',
  Austria: '🇦🇹',
  Australia: '🇦🇺',
  'United States': '🇺🇸',
}

const BrandByCountry = ({
  country,
  countries,
  allBrands,
  leading,
}: {
  country: BrandsByCountryDTO[number]
  countries: CountryListDTO
  allBrands: AllBrandsDTO
  leading: boolean
}) => {
  const manufacturerCount = country.manufacturers.length

  return (
    <Card className={`overflow-hidden mb-6 ${leading ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{countryFlags[country.name] || '🏭'}</span>
            <div>
              <CardTitle className="text-lg">{country.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Factory className="w-3 h-3" />
                {manufacturerCount} manufacturer{manufacturerCount !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          {leading && (
            <Badge
              variant="secondary"
              className="text-xs text-primary-foreground hover:bg-secondary cursor-default"
            >
              Leading Region
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {country.manufacturers.map(brand => {
            const { id, firstName, name, slug, icon } = brand
            return (
              <div key={id} className="flex items-center gap-2 group">
                <IsAdmin>
                  <BrandEdit brand={brand} countries={countries} brands={allBrands} />
                </IsAdmin>

                <Link className="flex-1 no-underline" href={FrontRoutes.Brands + slug}>
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
                      <p className="font-medium text-sm capitalize truncate group-hover:text-primary transition-colors">
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

  // Get top countries by manufacturer count
  const topCountries = brandsByCountry
    .sort((a, b) => b.manufacturers.length - a.manufacturers.length)
    .slice(0, 3)

  return (
    <article className="mt-6 space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-6">
          <Factory className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-3xl text-secondary tracking-tight">Manufacturers</h2>
            <p className="text-lg text-muted-foreground">
              Master craftsmen and renowned barometer makers
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Manufacturers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalManufacturers}</div>
              <p className="text-xs text-muted-foreground">Craftsmen in collection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCountries}</div>
              <p className="text-xs text-muted-foreground">Different regions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leading Regions</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {topCountries.map(country => (
                  <div key={country.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span>{countryFlags[country.name] || '🏭'}</span>
                      {country.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {country.manufacturers.length}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Discover the master craftsmen, renowned manufacturers and distinguished sellers behind
          these exceptional barometers, each reflecting timeless artistry and precision. Here is a
          curated list of barometer makers, along with detailed descriptions and iconic works by
          each master from the collection, representing the finest traditions of craftsmanship.
        </p>
      </header>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandsByCountry.map((country, i) => (
          <BrandByCountry
            leading={[0, 1, 2].includes(i)}
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
