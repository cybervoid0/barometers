import React from 'react'
import { Container, Grid, GridCol, Stack, Title } from '@mantine/core'
import { fetchBarometerList } from '@/utils/fetch'
import { BarometerCardWithIcon } from '@/app/components/barometer-card'
import { Pagination } from '@/app/components/pagination'
import { barometerRoute, categoriesRoute } from '@/utils/routes-front'

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
    <Container py="xl" size="xl">
      <Stack gap="xs">
        <Title tt="capitalize" mb="sm" component="h2">
          Last Added
        </Title>

        <Grid justify="center" gutter="xl">
          {barometers.map(({ name, id, images, manufacturer, slug, category }) => (
            <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={id}>
              <BarometerCardWithIcon
                barometerName={name}
                barometerLink={barometerRoute + slug}
                categoryName={category.name}
                categoryLink={categoriesRoute + category.name}
                manufacturer={manufacturer.name}
                image={images.at(0)!}
              />
            </GridCol>
          ))}
        </Grid>
        {totalPages > 1 && <Pagination total={totalPages} value={page} />}
      </Stack>
    </Container>
  )
}
