import { type Metadata } from 'next'
import { Container, Grid, GridCol, Title } from '@mantine/core'
import { getManufacturer } from '@/app/api/v2/manufacturers/[slug]/getters'
import { withPrisma } from '@/prisma/prismaClient'
import { title } from '@/app/metadata'
import { BarometerCardWithIcon } from '@/app/components/barometer-card'
import { barometerRoute, categoriesRoute } from '@/utils/routes-front'
import { MD } from '@/app/components/md'
import sx from '../styles.module.scss'

interface Props {
  params: {
    slug: string
  }
}

export const dynamic = 'force-static'

const getBarometersByManufacturer = withPrisma(async (prisma, slug: string) =>
  prisma.barometer.findMany({
    where: { manufacturer: { slug } },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      images: {
        where: {
          order: 0,
        },
      },
    },
    orderBy: { name: 'asc' },
  }),
)

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const manufacturer = await getManufacturer(slug)
  return {
    title: `${title} - Manufacturer: ${manufacturer.name}`,
  }
}

export const generateStaticParams = withPrisma(async prisma =>
  prisma.manufacturer.findMany({
    select: { slug: true },
  }),
)

export default async function Manufacturer({ params: { slug } }: Props) {
  const manufacturer = await getManufacturer(slug)
  const barometers = await getBarometersByManufacturer(slug)
  return (
    <Container size="xl">
      <Title tt="capitalize" mt="xl" mb="sm" component="h2">
        {manufacturer.name}
      </Title>

      <MD className={sx.description}>{manufacturer.description}</MD>

      <Grid justify="center" gutter="xl">
        {barometers.map(({ name, id, images, slug: barometerSlug, category }) => (
          <GridCol span={{ base: 6, xs: 3, lg: 3 }} key={id}>
            <BarometerCardWithIcon
              barometerName={name}
              barometerLink={barometerRoute + barometerSlug}
              categoryLink={categoriesRoute + category.name}
              categoryName={category.name}
              image={images.at(0)!}
            />
          </GridCol>
        ))}
      </Grid>
    </Container>
  )
}
