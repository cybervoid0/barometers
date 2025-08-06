import { Metadata } from 'next'
import capitalize from 'lodash/capitalize'
import { imageStorage, BAROMETERS_PER_CATEGORY_PAGE } from '@/utils/constants'
import { FrontRoutes } from '@/utils/routes-front'
import { BarometerCard } from '@/app/components/barometer-card'
import { SortValue, SortOptions, DynamicOptions } from '@/app/types'
import Sort from './sort'
import { ShowMore } from '@/app/components/showmore'
import { title, openGraph, twitter } from '@/app/metadata'
import { Pagination } from '@/components/ui/pagination'
import { withPrisma } from '@/prisma/prismaClient'
import { getCategory, getBarometersByParams } from '@/app/services'
import { FooterVideo } from '@/app/components/footer-video'

export const dynamicParams = true
export const dynamic: DynamicOptions = 'force-static'

interface CollectionProps {
  params: {
    // category should include [categoryName, sortCriteria, pageNo]
    category: [string, string, string]
  }
}

export async function generateMetadata({
  params: { category },
}: CollectionProps): Promise<Metadata> {
  const [categoryName] = category
  const { description } = await getCategory(categoryName)
  const { barometers } = await getBarometersByParams(categoryName, 1, 5, 'date')
  const collectionTitle = `${title}: ${capitalize(categoryName)} Barometers Collection`
  const barometerImages = barometers
    .filter(({ images }) => images && images.length > 0)
    .map(({ images, name }) => ({
      url: imageStorage + images.at(0)!.url,
      alt: name,
    }))
  const url = `${FrontRoutes.Categories}${category.join('/')}`
  return {
    title: collectionTitle,
    description,
    openGraph: {
      ...openGraph,
      url,
      title: collectionTitle,
      description,
      images: barometerImages,
    },
    twitter: {
      ...twitter,
      title: collectionTitle,
      description,
      images: barometerImages,
    },
  }
}

export default async function Collection({ params: { category } }: CollectionProps) {
  const [categoryName, sort, page] = category
  const { barometers, totalPages } = await getBarometersByParams(
    categoryName,
    Number(page),
    BAROMETERS_PER_CATEGORY_PAGE,
    sort as SortValue,
  )
  const { description } = await getCategory(categoryName)
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4">
        <h2>{categoryName}</h2>
        <ShowMore maxHeight={60} md>
          {description}
        </ShowMore>
        <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="hidden sm:block md:col-span-2 lg:col-span-3" />
          <Sort sortBy={sort as SortValue} className="col-span-2 sm:col-span-1" />
          {barometers.map(({ name, id, images, manufacturer, slug }, i) => (
            <BarometerCard
              key={id}
              priority={i < 5}
              image={images[0]}
              name={name}
              link={FrontRoutes.Barometer + slug}
              manufacturer={
                (manufacturer.firstName ? `${manufacturer.firstName} ` : '') + manufacturer.name
              }
            />
          ))}
        </div>
        {totalPages > 1 && <Pagination total={totalPages} value={+page} className="mx-auto mt-4" />}
      </div>
      {categoryName === 'recorders' && <FooterVideo />}
    </div>
  )
}

export const generateStaticParams = withPrisma(async prisma => {
  const categories = await prisma.category.findMany({ select: { name: true, id: true } })
  const categoriesWithCount = await prisma.barometer.groupBy({
    by: ['categoryId'],
    _count: {
      _all: true,
    },
  })
  // page rout is /collection/categories/{categoryName}/{sortCriteria}/{pageNumber}
  const params: { category: string[] }[] = []

  for (const { name, id } of categories) {
    const categoryData = categoriesWithCount.find(({ categoryId }) => categoryId === id)
    const barometersPerCategory = categoryData?._count._all ?? 0
    const pagesPerCategory = Math.ceil(barometersPerCategory / BAROMETERS_PER_CATEGORY_PAGE)
    // generate all category/sort/page combinations for static page generation
    for (const { value: sort } of SortOptions) {
      for (let page = 1; page <= pagesPerCategory; page += 1) {
        params.push({
          category: [name, sort, String(page)],
        })
      }
    }
  }
  return params
})
