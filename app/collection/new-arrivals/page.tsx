import React from 'react'
import { Container, Grid, GridCol, Stack, Title } from '@mantine/core'
import Link from 'next/link'
import { fetchBarometerList } from '@/utils/fetch'
import { BarometerCard } from '@/app/components/barometer-card'
import { Pagination } from '@/app/components/pagination'
import { barometerRoute, categoriesRoute } from '@/utils/routes-front'
import { CategoryIcon } from '@/app/components/category-icon'

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
          {barometers.map(({ name, id, images, manufacturer, slug, category }, i) => (
            <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={id} pos="relative">
              <Link href={categoriesRoute + category.name}>
                <CategoryIcon
                  category={category.name}
                  bgColor="white"
                  style={{ position: 'absolute', zIndex: 10, right: '15px', top: '18px' }}
                />
              </Link>
              <BarometerCard
                priority={i < 8}
                image={images[0]}
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
