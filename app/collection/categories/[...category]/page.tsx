import { Metadata } from 'next'
import capitalize from 'lodash/capitalize'
import { Container, Grid, GridCol, Stack, Title } from '@mantine/core'
import { googleStorageImagesFolder, BAROMETERS_PER_CATEGORY_PAGE } from '@/utils/constants'
import { FrontRoutes } from '@/utils/routes-front'
import { BarometerCard } from '@/app/components/barometer-card'
import { SortValue, SortOptions, DynamicOptions } from '@/app/types'
import Sort from './sort'
import { DescriptionText } from '@/app/components/description-text'
import { title, openGraph, twitter } from '@/app/metadata'
import { Pagination } from './pagination'
import { withPrisma } from '@/prisma/prismaClient'
import { getCategory, getBarometersByParams } from '@/app/services'
import { FooterVideo } from '@/app/components/footer-video'

// all non-generated posts will give 404
export const dynamicParams = false
export const dynamic: DynamicOptions = 'force-static'

interface CollectionProps {
  params: {
    // category should include [categoryName, sortCriteria, pageNo]
    category: string[]
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
      url: googleStorageImagesFolder + images.at(0)!.url,
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
    <Container py="xl" size="xl">
      <Stack gap="xs">
        <Title tt="capitalize" component="h2">
          {categoryName}
        </Title>
        {description && <DescriptionText description={description} />}
        <Sort sortBy={sort as SortValue} style={{ alignSelf: 'flex-end' }} />
        <Grid justify="center" gutter="xl">
          {barometers.map(({ name, id, images, manufacturer, slug }, i) => (
            <GridCol span={{ base: 6, md: 4, lg: 3 }} key={id}>
              <BarometerCard
                priority={i < 5}
                image={images[0]}
                name={name}
                link={FrontRoutes.Barometer + slug}
                manufacturer={
                  (manufacturer.firstName ? `${manufacturer.firstName} ` : '') + manufacturer.name
                }
              />
            </GridCol>
          ))}
        </Grid>
        {totalPages > 1 && <Pagination total={totalPages} value={+page} />}
      </Stack>
      {categoryName === 'recorders' && <FooterVideo />}
    </Container>
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
