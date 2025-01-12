import { type Metadata } from 'next'
import { Container, Grid, GridCol, Title, Text } from '@mantine/core'
import Link from 'next/link'
import { getManufacturer } from '@/app/api/v2/manufacturers/[slug]/getters'
import { withPrisma } from '@/prisma/prismaClient'
import { title } from '@/app/metadata'
import { BarometerCard } from '@/app/components/barometer-card'
import { barometerRoute, categoriesRoute } from '@/app/constants'
import { CategoryIcon } from '@/app/components/category-icon'

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
    where: {
      NOT: {
        name: 'unsigned',
      },
    },
    select: { slug: true },
  }),
)

export default async function Manufacturer({ params: { slug } }: Props) {
  const manufacturer = await getManufacturer(slug)
  const barometers = await getBarometersByManufacturer(slug)
  return (
    <Container>
      <Title tt="capitalize" my="xl" component="h2">
        {manufacturer.name}
      </Title>

      <Text>{manufacturer.description}</Text>

      <Grid justify="center" gutter="xl">
        {barometers.map(({ name, id, images, slug: barometerSlug, category }, i) => (
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
              image={images.at(0)}
              name={name}
              link={barometerRoute + barometerSlug}
            />
          </GridCol>
        ))}
      </Grid>
    </Container>
  )
}
