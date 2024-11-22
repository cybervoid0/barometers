import { Container, Grid, GridCol } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { barometerTypesApiRoute, barometerTypesRoute } from './constants'
import { IBarometerType } from '@/models/type'
import { Search } from './components/search'

export default async function HomePage() {
  let barometerTypes: IBarometerType[] = []
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) throw new Error('Base URL is not set. Please configure NEXT_PUBLIC_BASE_URL.')
  const res = await fetch(baseUrl + barometerTypesApiRoute, {
    cache: 'force-cache',
  })
  if (!res.ok) throw new Error(res.statusText)
  barometerTypes = await res.json()

  return (
    <>
      <HeadingImage />
      <Search />
      <Container size="xl" pb="2.3rem">
        <Grid justify="center" gutter={{ base: '2rem', sm: '2.5rem' }}>
          {barometerTypes.map(({ _id, label, name, image }, i) => (
            <GridCol key={String(_id)} span={{ base: 12, xs: 6, lg: 4 }}>
              <CategoryCard
                priority={i < 3}
                image={image}
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
