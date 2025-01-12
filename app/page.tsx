import { Container, Grid, GridCol, Group } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { categoriesRoute } from '@/utils/routes-front'
import { SearchField } from './components/search-field'
import { getCategories } from './api/v2/categories/getters'
import { NewArrivals } from './components/new-arrivals'
//import sx from './styles.module.scss'

export const dynamic = 'force-static'

export default async function HomePage() {
  const categories = await getCategories()
  return (
    <>
      <HeadingImage />
      <Container size="xl" pb="2.3rem">
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
                link={categoriesRoute + name}
              />
            </GridCol>
          ))}
        </Grid>
      </Container>
    </>
  )
}
