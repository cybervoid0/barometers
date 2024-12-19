import { Metadata } from 'next'
import capitalize from 'lodash/capitalize'
import { Container, Grid, GridCol, Stack, Title } from '@mantine/core'
import { barometerRoute, googleStorageImagesFolder, barometerTypesRoute } from '@/app/constants'
import { BarometerCard } from './components/barometer-card'
import { slug } from '@/utils/misc'
import { SortValue } from './types'
import Sort from './sort'
import { fetchBarometersByCategory, fetchCategory } from '@/utils/fetch'
import { DescriptionText } from '@/app/components/description-text'
import { title, openGraph, twitter } from '@/app/metadata'
import { Pagination } from '@/app/components/pagination'
import { getPrismaClient } from '@/prisma/prismaClient'

interface CollectionProps {
  params: {
    category: string
  }
  searchParams: {
    sort?: SortValue
    page?: string
  }
}

const PAGE_SIZE = 12

export async function generateMetadata({
  params: { category },
}: CollectionProps): Promise<Metadata> {
  const { description } = await fetchCategory(category)
  const { barometers } = await fetchBarometersByCategory({ category, size: 5 })
  const collectionTitle = `${title}: ${capitalize(category)} Barometers Collection`
  const barometerImages = barometers
    .filter(({ images }) => images && images.length > 0)
    .map(({ images, name }) => ({
      url: googleStorageImagesFolder + images.at(0),
      alt: name,
    }))
  const url = barometerTypesRoute + category
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

export default async function Collection({ params: { category }, searchParams }: CollectionProps) {
  const sort = searchParams.sort ?? 'date'
  const page = searchParams.page ?? '1'
  const { barometers, totalPages } = await fetchBarometersByCategory({
    category,
    sort,
    size: PAGE_SIZE,
    page,
  })
  const { description } = await fetchCategory(category)
  return (
    <Container py="xl" size="xl">
      <Stack gap="xs">
        <Title mb="sm" fw={500} order={2} tt="capitalize">
          {category}
        </Title>
        {description && <DescriptionText size="sm" description={description} />}
        <Sort sortBy={sort} style={{ alignSelf: 'flex-end' }} />
        <Grid justify="center" gutter="xl">
          {barometers.map(({ name, id, images, manufacturer }, i) => (
            <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={id}>
              <BarometerCard
                priority={i < 8}
                image={googleStorageImagesFolder + images[0].url}
                name={name}
                link={barometerRoute + slug(name)}
                manufacturer={manufacturer?.name}
              />
            </GridCol>
          ))}
        </Grid>
        {totalPages > 1 && <Pagination total={totalPages} value={+page} />}
      </Stack>
    </Container>
  )
}

export async function generateStaticParams() {
  const prisma = getPrismaClient()
  const categories = await prisma.category.findMany({ select: { name: true } })
  return categories.map(({ name }) => ({
    category: name.toLowerCase(),
  }))
}
