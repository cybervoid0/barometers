import 'server-only'

import Link from 'next/link'
import dayjs from 'dayjs'
import {
  IconBuildingFactory2,
  IconCalendarQuestion,
  IconTimeline,
  IconNumber,
  IconTopologyRing2,
  IconDimensions,
  IconTagStarred,
  IconCategory2,
  IconCurrencyEuro,
  IconWood,
} from '@tabler/icons-react'
import { FrontRoutes } from '@/utils/routes-front'
import { ImageCarousel } from './components/carousel'
import { Condition } from './components/condition'
import { BreadcrumbsComponent } from './components/breadcrumbs'
import { ShowMore } from '@/app/components/showmore'
import { Dimensions } from '@/app/types'
import { withPrisma } from '@/prisma/prismaClient'
import { getBarometer } from '@/app/services'
import { IsAdmin } from '@/app/components/is-admin'
import { PropertyCard } from './components/property-card/property-card'
import { DeleteBarometer } from './components/delete-barometer'
import { InaccuracyReport } from './components/inaccuracy-report'
import { MD } from '@/app/components/md'
import { Card } from '@/components/ui/card'
import { SeparatorWithText } from '@/components/ui/separator'
// edit components
import { DimensionEdit } from './components/edit-fields/dimensions-edit'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { TextAreaEdit } from './components/edit-fields/textarea-edit'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'
import { DateEdit } from './components/edit-fields/date-edit'
import { EstimatedPriceEdit } from './components/edit-fields/estimated-price-edit'
import { SubcategoryEdit } from './components/edit-fields/subcategory-edit'
import { MaterialsEdit } from './components/edit-fields/materials-edit'

export const dynamic = 'force-static'
export const dynamicParams = true

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
    <div className="container mx-auto pb-4 sm:pb-20">
      <BreadcrumbsComponent catId={barometer.collectionId} type={barometer.category.name} />
      <ImageCarousel barometer={barometer} />
      <Card className="p-6">
        <div className="mb-6 flex flex-row flex-nowrap items-center justify-between">
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
            icon={IconBuildingFactory2}
            title="Manufacturer or Retailer"
            edit={<ManufacturerEdit barometer={barometer} />}
          >
            <Link
              className="block underline"
              href={FrontRoutes.Brands + barometer.manufacturer.slug}
              /* display manufacturer name and city (or country if city is not specified) */
            >{`${firstName ? `${firstName} ` : ''}${name}, ${city ?? barometer.manufacturer.countries.map(state => state.name).join(', ')}`}</Link>
          </PropertyCard>
          <PropertyCard
            icon={IconNumber}
            title="Serial Number"
            edit={<TextFieldEdit barometer={barometer} property="serial" />}
          >
            {barometer.serial}
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={IconTopologyRing2}
            title="Collection ID"
            edit={<TextFieldEdit barometer={barometer} property="collectionId" />}
          >
            {barometer.collectionId}
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={IconCalendarQuestion}
            title="Year"
            edit={<DateEdit barometer={barometer} />}
          >
            {dayjs(barometer.date).format('YYYY')}
          </PropertyCard>
          <PropertyCard
            icon={IconTimeline}
            title="Dating"
            edit={<TextFieldEdit barometer={barometer} property="dateDescription" />}
          >
            {barometer.dateDescription}
          </PropertyCard>
          <PropertyCard
            icon={IconTagStarred}
            title="Condition"
            edit={<ConditionEdit barometer={barometer} />}
          >
            <Condition condition={barometer.condition} />
          </PropertyCard>
          <PropertyCard
            adminOnly={!barometer.subCategory?.name}
            icon={IconCategory2}
            title="Movement (Tube) Type"
            edit={<SubcategoryEdit barometer={barometer} />}
          >
            <p className="text-sm capitalize">{barometer.subCategory?.name}</p>
          </PropertyCard>
          <PropertyCard
            adminOnly
            icon={IconCurrencyEuro}
            title="Estimated Price"
            edit={<EstimatedPriceEdit barometer={barometer} />}
          >
            {barometer.estimatedPrice !== null
              ? `€${barometer.estimatedPrice.toFixed(2)}`
              : undefined}
          </PropertyCard>
          <PropertyCard
            adminOnly={dimensions.length === 0}
            icon={IconDimensions}
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
            icon={IconWood}
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
    </div>
  )
}

const DimListItem = ({ name, value }: { name: string; value: string }) => (
  <li>
    <span className="text-sm font-medium capitalize">{name}:</span>{' '}
    <span className="text-sm">{value}</span>
  </li>
)
