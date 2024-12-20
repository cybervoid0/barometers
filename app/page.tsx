import { Container, Grid, GridCol } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { barometerTypesRoute } from './constants'
import { SearchField } from './components/search-field'
import { getPrismaClient } from '@/prisma/prismaClient'
import { getCategories } from './api/v2/categories/getters'

export default async function HomePage() {
  const prisma = getPrismaClient()
  const categories = await getCategories(prisma)
  return (
    <>
      <HeadingImage />
      <Container size="xl" pb="2.3rem">
        <SearchField
          ml="auto"
          w={{ base: '100%', xs: 'calc(50% - 1.25rem)', lg: 'calc(33% - 1.25rem)' }}
        />
        <Grid justify="center" gutter={{ base: '2rem', sm: '2.5rem' }}>
          {categories.map(({ id, label, name, image }, i) => (
            <GridCol key={id} span={{ base: 12, xs: 6, lg: 4 }}>
              <CategoryCard
                priority={i < 3}
                image={image.url}
                name={label}
                link={barometerTypesRoute + name.toLowerCase()}
              />
            </GridCol>
          ))}
        </Grid>
      </Container>
    </>
  )
}
