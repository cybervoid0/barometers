import { Container, Grid, GridCol } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { barometerTypesApiRoute, barometerTypesRoute } from './constants'
import { IBarometerType } from '@/models/type'
import { ShowError } from './components/show-error'

export default async function HomePage() {
  let barometerTypes: IBarometerType[] = []
  let errorMessage = ''
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) throw new Error('Base URL is not set. Please configure NEXT_PUBLIC_BASE_URL.')
    const res = await fetch(baseUrl + barometerTypesApiRoute, {
      cache: 'force-cache',
    })
    if (!res.ok) throw new Error(res.statusText)
    barometerTypes = await res.json()
  } catch (error) {
    console.error('Error fetching barometer types:', error)
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Unable to load barometer types. Please try again later.'
  }

  return (
    <>
      <HeadingImage />
      <Container size="xl" pb="2.3rem">
        {errorMessage ? (
          <ShowError message={errorMessage} />
        ) : (
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
        )}
      </Container>
    </>
  )
}
