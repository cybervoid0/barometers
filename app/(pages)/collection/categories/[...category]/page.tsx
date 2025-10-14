import 'server-only'

import capitalize from 'lodash/capitalize'
import type { Metadata } from 'next'
import { FooterVideo } from '@/components/containers'
import { BarometerCard, ShowMore } from '@/components/elements'
import { Card, Pagination } from '@/components/ui'
import { DEFAULT_PAGE_SIZE, fileStorage } from '@/constants'
import { openGraph, title, twitter } from '@/constants/metadata'
import { Route } from '@/constants/routes'
import { withPrisma } from '@/prisma/prismaClient'
import { getBarometersByParams } from '@/server/barometers/queries'
import { getCategory } from '@/server/categories/queries'
import { type DynamicOptions, SortOptions, type SortValue } from '@/types'
import Sort from './sort'

export const dynamicParams = true
export const dynamic: DynamicOptions = 'force-static'

interface CollectionProps {
  params: Promise<{
    // category should include [categoryName, sortCriteria, pageNo]
    category: [string, string, string]
  }>
}

export async function generateMetadata(props: CollectionProps): Promise<Metadata> {
  const { category } = await props.params
  const [categoryName] = category
  const { description } = await getCategory(categoryName)
  const { barometers } = await getBarometersByParams(categoryName, 1, 5, 'date')
  const collectionTitle = `${title}: ${capitalize(categoryName)} Barometers Collection`
  // TODO: Load scaled image rather that full size
  const barometerImages = barometers
    .filter(({ images }) => images && images.length > 0)
    .map(({ images, name }) => ({
      url: fileStorage + (images.at(0)?.url ?? ''),
      alt: name,
    }))
  const url = `${Route.Categories}${category.join('/')}`
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

export default async function Collection(props: CollectionProps) {
  const params = await props.params

  const { category } = params

  const [categoryName, sort, page] = category
  const pageNo = Math.max(parseInt(page, 10) || 1, 1)
  const { barometers, totalPages } = await getBarometersByParams(
    categoryName,
    pageNo,
    DEFAULT_PAGE_SIZE,
    sort as SortValue,
  )
  const { description } = await getCategory(categoryName)
  return (
    <>
      <div className="flex flex-col gap-4 pt-6">
        <h2>{categoryName}</h2>
        <ShowMore maxHeight={60} md>
          {description}
        </ShowMore>
        <Sort sortBy={sort as SortValue} className="w-[200px] self-end sm:w-[320px]" />
        <Card className="p-4 shadow-md">
          <div className="grid grid-cols-2 gap-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {barometers.map(({ name, id, images, manufacturer, slug }, i) => (
              <BarometerCard
                key={id}
                priority={i < 5}
                image={images[0]}
                name={name}
                link={Route.Barometer + slug}
                manufacturer={
                  (manufacturer.firstName ? `${manufacturer.firstName} ` : '') + manufacturer.name
                }
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination pageAsRoute total={totalPages} value={pageNo} className="mt-4" />
          )}
        </Card>
      </div>
      {categoryName === 'recorders' && <FooterVideo />}
    </>
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
    const pagesPerCategory = Math.ceil(barometersPerCategory / DEFAULT_PAGE_SIZE)
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
