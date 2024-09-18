import { Container, Grid, GridCol, Title } from '@mantine/core'
import { HeadingImage } from './components/heading-image'
import { CategoryCard, categoryCardsList } from './components/category-card'

export default function HomePage() {
  return (
    <>
      <HeadingImage />
      <Container size="xl" pb="2.3rem">
        <Title order={1} size="h2" py={{ base: 'lg', lg: 'xl' }}>
          Welcome to Leo&apos;s Barometers Collection
        </Title>
        <Grid gutter={{ base: 'xs', sm: 'lg' }}>
          {categoryCardsList.map(card => (
            <GridCol key={card.id} span={{ base: 12, xs: 6, lg: 4 }}>
              <CategoryCard {...card} />
            </GridCol>
          ))}
        </Grid>
      </Container>
    </>
  )
}
