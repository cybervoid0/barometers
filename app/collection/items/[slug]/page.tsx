import { type Metadata } from 'next'
import { getServerSession } from 'next-auth'
import capitalize from 'lodash/capitalize'
import { Container, Title, Text, Box, Divider, Tooltip } from '@mantine/core'
import { AccessRole } from '@prisma/client'
import { authConfig, getUserByEmail } from '@/utils/auth'
import { googleStorageImagesFolder, barometerRoute } from '@/app/constants'
import { ImageCarousel } from './components/carousel'
import { Condition } from './components/condition'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { DescriptionEdit } from './components/edit-fields/description-edit'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'
import { BreadcrumbsComponent } from './components/breadcrumbs'
import sx from './styles.module.scss'
import DimensionEdit from './components/edit-fields/dimensions-edit'
import { DescriptionText } from '@/app/components/description-text'
import { title, openGraph, twitter } from '@/app/metadata'
import { Dimensions } from '@/app/types'
import { getPrismaClient } from '@/prisma/prismaClient'
import { getBarometer } from '@/app/api/v2/barometers/[slug]/getters'

interface Slug {
  slug: string
}
interface BarometerItemProps {
  params: Slug
}

export async function generateMetadata({
  params: { slug },
}: BarometerItemProps): Promise<Metadata> {
  const prisma = getPrismaClient()
  const { description, name, images } = await getBarometer(prisma, slug)
  await prisma.$disconnect()
  const barometerTitle = `${title}: ${capitalize(name)}`
  const barometerImages =
    images &&
    images.map(image => ({
      url: googleStorageImagesFolder + image,
      alt: name,
    }))
  const url = barometerRoute + slug
  return {
    title: barometerTitle,
    description,
    openGraph: {
      ...openGraph,
      title: barometerTitle,
      description,
      url,
      images: barometerImages,
    },
    twitter: {
      ...twitter,
      title: name,
      description,
      images: barometerImages?.map(image => ({
        url: image.url,
        alt: image.alt,
      })),
    },
  }
}

/**
 * This function fetches all barometers from the API and maps their slugs
 * to be used as static parameters for Next.js static generation.
 */
export async function generateStaticParams(): Promise<Slug[]> {
  const prisma = getPrismaClient()
  const barometers = await prisma.barometer.findMany({ select: { slug: true } })
  await prisma.$disconnect()
  return barometers
}

async function isAuthorized(): Promise<boolean> {
  try {
    const session = await getServerSession(authConfig)
    const email = session?.user?.email
    if (!email) return false
    const { role } = await getUserByEmail(email)
    return role === AccessRole.ADMIN
  } catch (error) {
    return false
  }
}

export default async function BarometerItem({ params: { slug } }: BarometerItemProps) {
  const prisma = getPrismaClient()
  const isAdmin = await isAuthorized()
  const barometer = await getBarometer(prisma, slug)
  await prisma.$disconnect()
  const { name, images, description, manufacturer, dateDescription, condition, collectionId } =
    barometer
  const dimensions = barometer.dimensions as Dimensions
  return (
    <Container size="xl">
      <Box px={{ base: 'none', sm: 'xl' }} pb={{ base: 'xl', sm: '5rem' }}>
        <BreadcrumbsComponent catId={barometer.collectionId} type={barometer.category.name} />
        <ImageCarousel
          isAdmin={isAdmin}
          barometer={barometer}
          images={images.map(image => googleStorageImagesFolder + image)}
        />
        <Box mb="md">
          <Title className={sx.title}>{`${name.split(' ').slice(0, -1).join(' ')} `}</Title>
          <Title className={sx.title} style={{ whiteSpace: 'nowrap' }}>
            {name.split(' ').at(-1)}
            {isAdmin && <TextFieldEdit barometer={barometer} property="name" size={22} />}
          </Title>
          <Tooltip label="Collection ID">
            <Text className={sx.collectionId}>{collectionId}</Text>
          </Tooltip>
        </Box>

        {manufacturer && (
          <Box>
            <Title fw={500} display="inline" order={3}>
              Manufacturer/Retailer:&nbsp;
            </Title>
            <Title c="dark.3" fw={400} display="inline" order={3}>
              {`${manufacturer.name}${manufacturer.city ? `, ${manufacturer.city}` : ''}`}
              {isAdmin && <ManufacturerEdit barometer={barometer} />}
            </Title>
          </Box>
        )}

        <Box>
          <Title fw={500} display="inline" order={3}>
            Dating:&nbsp;
          </Title>
          <Title c="dark.3" fw={400} display="inline" order={3}>
            {dateDescription}
            {isAdmin && <TextFieldEdit barometer={barometer} property="dateDescription" />}
          </Title>
        </Box>

        {dimensions && dimensions.length > 0 && (
          <Box>
            <Title fw={500} order={3}>
              Dimensions:{' '}
              {dimensions.map((dimension, index, arr) => (
                <Text c="dark.3" display="inline" key={index}>
                  {dimension.dim} {dimension.value}
                  {index < arr.length - 1 ? ', ' : ''}
                </Text>
              ))}
              {isAdmin && <DimensionEdit barometer={barometer} />}
            </Title>
          </Box>
        )}

        <Condition
          condition={condition}
          editButton={isAdmin && <ConditionEdit barometer={barometer} />}
        />

        <Divider
          mx="lg"
          my="lg"
          {...(isAdmin && {
            label: <DescriptionEdit barometer={barometer} />,
            labelPosition: 'right',
          })}
        />
        {description ? (
          <DescriptionText description={description} />
        ) : (
          isAdmin && <Text>Add description</Text>
        )}
      </Box>
    </Container>
  )
}
