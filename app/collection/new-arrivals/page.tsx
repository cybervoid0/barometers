import 'server-only'

import { fetchBarometerList } from '@/utils/fetch'
import { BarometerCardWithIcon } from '@/app/components/barometer-card'
import { Pagination } from '@/components/ui/pagination'
import { FrontRoutes } from '@/utils/routes-front'
import { Card } from '@/components/ui/card'

const itemsOnPage = 12

interface newArrivalsProps {
  searchParams: Record<string, string>
}

export default async function NewArrivals({ searchParams }: newArrivalsProps) {
  const { barometers, totalPages, page } = await fetchBarometerList({
    sort: 'last-added',
    page: searchParams.page ?? 1,
    size: searchParams.size ?? itemsOnPage,
  })
  return (
    <>
      <div className="flex flex-col gap-2 pt-6">
        <h2>Last Added</h2>

        <p>Discover the latest additions to the collection!</p>
        <p className="mb-6">
          This section highlights newly added barometers and weather instruments from every
          category. Whether it&apos;s a self-registering recorder, a rare Bourdon barometer, or a
          compact pocket device, each piece reflects the fascinating evolution of weather
          measurement. Explore and find inspiration in these timeless tools.
        </p>

        <Card className="p-4 shadow-md">
          <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {barometers.map(({ name, id, images, manufacturer, slug, category }) => (
              <BarometerCardWithIcon
                key={id}
                barometerName={name}
                barometerLink={FrontRoutes.Barometer + slug}
                categoryName={category.name}
                categoryLink={FrontRoutes.Categories + category.name}
                manufacturer={
                  (manufacturer.firstName ? `${manufacturer.firstName} ` : '') + manufacturer.name
                }
                image={images.at(0)!}
              />
            ))}
          </div>
          {totalPages > 1 && <Pagination total={totalPages} value={page} className="mt-4" />}
        </Card>
      </div>
    </>
  )
}
