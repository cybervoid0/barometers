import { Container, Grid, GridCol, Group } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { SearchField } from './components/search-field'
import { NewArrivals } from './components/new-arrivals'
import { FrontRoutes } from '@/utils/routes-front'
import { getCategories } from './services'
import { markForWarming } from '@/utils/images'

export const dynamic = 'force-static'

export default async function HomePage() {
  const categories = await getCategories()
  await markForWarming(categories.map(({ image }) => image.url))
  return (
    <>
      <HeadingImage />
      <Container size="xl">
        <Group align="center" wrap="nowrap">
          <NewArrivals />
          <SearchField
            ml="auto"
            w={{ base: '100%', xs: 'calc(50% - 1.25rem)', lg: 'calc(33% - 1.25rem)' }}
          />
        </Group>
        <Grid justify="center" gutter={{ base: '2rem', sm: '2.5rem' }}>
          {categories.map(({ id, name, image }, i) => (
            <GridCol key={id} span={{ base: 12, xs: 6, lg: 4 }}>
              <CategoryCard
                priority={i < 3}
                image={image}
                name={name}
                link={FrontRoutes.Categories + name}
              />
            </GridCol>
          ))}
        </Grid>
      </Container>
    </>
  )
}
