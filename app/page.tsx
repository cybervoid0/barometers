import { Container, Grid, GridCol } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard } from './components/category-card'
import { barometerTypesRoute, googleStorageImagesFolder } from './constants'
import { IBarometerType } from '@/models/type'
import { listTypes } from '@/actions/barometer-types'

export default async function HomePage() {
  const barometerTypes: IBarometerType[] = await listTypes()
  return (
    <>
      <HeadingImage />
      <Container size="xl" pb="2.3rem">
        <Grid justify="center" gutter={{ base: '2rem', sm: '2.5rem' }}>
          {barometerTypes.map(({ image, label, name }, i) => (
            <GridCol key={String(i)} span={{ base: 12, xs: 6, lg: 4 }}>
              <CategoryCard
                image={googleStorageImagesFolder + image}
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
