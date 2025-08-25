import 'server-only'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  BadgeEuro,
  Calendar,
  CalendarRange,
  Factory,
  Hash,
  Network,
  Ruler,
  ShoppingCart,
  Star,
  TreePine,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { IsAdmin, MD, ShowMore } from '@/components/elements'
import { Card, SeparatorWithText } from '@/components/ui'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { getBarometer } from '@/services'
import { Dimensions } from '@/types'
import { BreadcrumbsComponent } from './components/breadcrumbs'
// local components
import { ImageCarousel } from './components/carousel'
import { Condition } from './components/condition'
import { DeleteBarometer } from './components/delete-barometer'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { DateEdit } from './components/edit-fields/date-edit'
// edit components
import { DimensionEdit } from './components/edit-fields/dimensions-edit'
import { EstimatedPriceEdit } from './components/edit-fields/estimated-price-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'
import { MaterialsEdit } from './components/edit-fields/materials-edit'
import { PurchasedAtEdit } from './components/edit-fields/purchased-at-edit'
import { SubcategoryEdit } from './components/edit-fields/subcategory-edit'
import { TextAreaEdit } from './components/edit-fields/textarea-edit'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { InaccuracyReport } from './components/inaccuracy-report'
import { PropertyCard } from './components/property-card/property-card'

export const dynamic = 'force-static'
export const dynamicParams = true
dayjs.extend(utc)

interface Props {
  params: {
    slug: string
  }
}

/**
 * This function fetches all barometers from the API and maps their slugs
 * to be used as static parameters for Next.js static generation.
 */
export const generateStaticParams = withPrisma(prisma =>
  prisma.barometer.findMany({ select: { slug: true } }),
)

export default async function Page({ params: { slug } }: Props) {
  const barometer = await getBarometer(slug)
  const { firstName, name, city } = barometer.manufacturer
  const dimensions = (barometer.dimensions ?? []) as Dimensions
  return (
    <>
      <BreadcrumbsComponent catId={barometer.collectionId} type={barometer.category.name} />
      <ImageCarousel barometer={barometer} />
      <Card className="p-4 shadow-md">
        <div className="flex flex-row flex-nowrap items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <h3>{barometer.name}</h3>
            <IsAdmin>
              <TextFieldEdit barometer={barometer} property="name" />
            </IsAdmin>
          </div>
          <DeleteBarometer barometer={barometer} />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <PropertyCard
            icon={Factory}
            title="Manufacturer | Retailer"
            edit={<ManufacturerEdit barometer={barometer} />}
          >
            <Link
              className="block text-sm"
              href={FrontRoutes.Brands + barometer.manufacturer.slug}
              /* display manufacturer name and city (or country if city is not specified) */
            >{`${firstName ? `${firstName} ` : ''}${name}, ${city ?? barometer.manufacturer.countries.map(state => state.name).join(', ')}`}</Link>
          </PropertyCard>
          <PropertyCard
            icon={Hash}
            title="Serial Number"
            edit={<TextFieldEdit barometer={barometer} property="serial" />}
          >
            {barometer.serial}
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={Network}
            title="Collection ID"
            edit={<TextFieldEdit barometer={barometer} property="collectionId" />}
          >
            {barometer.collectionId}
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={Calendar}
            title="Year"
            edit={<DateEdit barometer={barometer} />}
          >
            {dayjs(barometer.date).format('YYYY')}
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={ShoppingCart}
            title="Purchased"
            edit={<PurchasedAtEdit barometer={barometer} />}
          >
            {barometer.purchasedAt
              ? dayjs.utc(barometer.purchasedAt).format('DD/MM/YYYY')
              : 'Not specified'}
          </PropertyCard>
          <PropertyCard
            icon={CalendarRange}
            title="Dating"
            edit={<TextFieldEdit barometer={barometer} property="dateDescription" />}
          >
            {barometer.dateDescription}
          </PropertyCard>
          <PropertyCard
            icon={Star}
            title="Condition"
            edit={<ConditionEdit barometer={barometer} />}
          >
            <Condition condition={barometer.condition} />
          </PropertyCard>
          <PropertyCard
            adminOnly={!barometer.subCategory?.name}
            icon={Wrench}
            title="Movement Type"
            edit={<SubcategoryEdit barometer={barometer} />}
          >
            <p className="text-sm capitalize">{barometer.subCategory?.name}</p>
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={BadgeEuro}
            title="Estimated Price"
            edit={<EstimatedPriceEdit barometer={barometer} />}
          >
            {barometer.estimatedPrice !== null
              ? `€${barometer.estimatedPrice.toFixed(2)}`
              : undefined}
          </PropertyCard>
          <PropertyCard
            adminOnly={dimensions.length === 0}
            icon={Ruler}
            title="Dimensions"
            edit={<DimensionEdit barometer={barometer} />}
          >
            <ul className="list-none">
              {/* For non-admins show only the first two items */}
              {dimensions.slice(0, 2).map(({ dim, value }) => (
                <DimListItem key={dim} name={dim} value={value} />
              ))}
              <IsAdmin>
                {dimensions.slice(2).map(({ dim, value }) => (
                  <DimListItem key={dim} name={dim} value={value} />
                ))}
              </IsAdmin>
            </ul>
          </PropertyCard>
          <PropertyCard
            adminOnly={!barometer.materials || barometer.materials.length === 0}
            icon={TreePine}
            title="Materials"
            edit={<MaterialsEdit barometer={barometer} />}
          >
            <p className="text-sm capitalize">
              {barometer.materials.map(item => item.name).join(', ')}
            </p>
          </PropertyCard>
        </div>
        <div className="flex flex-row items-center gap-2">
          <h3 className="capitalize">Object Overview</h3>
          <IsAdmin>
            <TextAreaEdit barometer={barometer} property="description" />
          </IsAdmin>
        </div>

        {barometer.description ? (
          <ShowMore md maxHeight={180}>
            {barometer.description}
          </ShowMore>
        ) : (
          <IsAdmin>
            <p>Add description</p>
          </IsAdmin>
        )}

        <SeparatorWithText>
          <InaccuracyReport barometer={barometer} />
        </SeparatorWithText>

        <IsAdmin>
          <div className="flex flex-row items-center gap-2">
            <h3>Provenance</h3>
            <IsAdmin>
              <TextAreaEdit barometer={barometer} property="provenance" />
            </IsAdmin>
          </div>
          {barometer.provenance ? <MD>{barometer.provenance}</MD> : <p>No text</p>}
        </IsAdmin>
      </Card>
    </>
  )
}

const DimListItem = ({ name, value }: { name: string; value: string }) => (
  <li className="leading-tight">
    <span className="text-sm font-medium capitalize">{name}:</span>{' '}
    <span className="text-sm">{value}</span>
  </li>
)
