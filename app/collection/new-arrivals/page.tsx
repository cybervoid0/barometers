import React from 'react'
import { Container, Grid, GridCol, Stack, Title } from '@mantine/core'
import { fetchBarometerList } from '@/utils/fetch'
import { BarometerCard } from '@/app/components/barometer-card'
import { Pagination } from '@/app/components/pagination'
import { googleStorageImagesFolder, barometerRoute } from '@/app/constants'

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
        <Title mb="sm" fw={500} order={2} tt="capitalize">
          Last Added
        </Title>

        <Grid justify="center" gutter="xl">
          {barometers.map(({ name, id, images, manufacturer, slug }, i) => (
            <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={id}>
              <BarometerCard
                priority={i < 8}
                image={googleStorageImagesFolder + images[0].url}
                name={name}
                link={barometerRoute + slug}
                manufacturer={manufacturer?.name}
              />
            </GridCol>
          ))}
        </Grid>
        {totalPages > 1 && <Pagination total={totalPages} value={page} />}
      </Stack>
    </Container>
  )
}
