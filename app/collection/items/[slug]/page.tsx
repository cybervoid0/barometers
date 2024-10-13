import { type Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { Container, Title, Text, Spoiler, Box, Divider } from '@mantine/core'
import { authConfig, getUserByEmail } from '@/utils/auth'
import { IBarometer } from '@/models/barometer'
import {
  barometersApiRoute,
  googleStorageImagesFolder,
  barometerRoute,
  twitterAccount,
} from '@/app/constants'
import { ShowError } from '@/app/components/show-error'
import { ImageCarousel } from './components/carousel'
import { Condition } from './components/condition'
import { AccessRole } from '@/models/user'
import { TextFieldEdit } from './components/edit-fields/textfield-edit'
import { DescriptionEdit } from './components/edit-fields/description-edit'
import { ConditionEdit } from './components/edit-fields/condition-edit'
import { ManufacturerEdit } from './components/edit-fields/manufacturer-edit'

interface BarometerItemProps {
  params: {
    slug: string
  }
}

async function fetchBarometer(slug: string): Promise<IBarometer> {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute + slug, {
    next: { revalidate: 600 },
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export async function generateMetadata({
  params: { slug },
}: BarometerItemProps): Promise<Metadata> {
  try {
    const barometer = await fetchBarometer(slug)

    const images =
      barometer.images?.map(image => ({
        url: googleStorageImagesFolder + image,
        alt: barometer.name,
      })) ?? []

    return {
      title: barometer.name,
      description: barometer.description,
      keywords: ['barometer', ...barometer.name.split(' ')],
      openGraph: {
        title: barometer.name,
        description: barometer.description,
        url: process.env.NEXT_PUBLIC_BASE_URL + barometerRoute + slug,
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title: barometer.name,
        description: barometer.description,
        images: images.map(image => ({
          url: image.url,
          alt: image.alt,
        })),
        site: twitterAccount,
      },
    }
  } catch (error) {
    return {
      title: 'Barometers Error',
    }
  }
}

async function isAuthorized(): Promise<boolean> {
  try {
    const session = await getServerSession(authConfig)
    const { role } = await getUserByEmail(session?.user?.email)
    return role === AccessRole.ADMIN
  } catch (error) {
    return false
  }
}

export default async function BarometerItem({ params: { slug } }: BarometerItemProps) {
  try {
    const isAdmin = await isAuthorized()
    const barometer: IBarometer = await fetchBarometer(slug)
    const { name, images, description, manufacturer, dating, dimensions, condition, collectionId } =
      barometer

    return (
      <Container pt={{ base: 'none', sm: '5rem' }} size="xl">
        <Box px={{ base: 'none', sm: 'xl' }} pb={{ base: 'xl', sm: '5rem' }}>
          <ImageCarousel images={images?.map(image => googleStorageImagesFolder + image) ?? []} />
          <Title
            w="fit-content"
            pos="relative"
            fw={500}
            mt={{ base: 'lg', sm: '5rem' }}
            mb="md"
            tt="capitalize"
          >
            {name}
            {isAdmin && <TextFieldEdit barometer={barometer} property="name" size={22} />}
            <Text
              pos="absolute"
              top="0"
              right="0"
              c="dark.2"
              fw={300}
              size="xs"
              style={{ textTransform: 'capitalize', transform: 'translateX(100%)' }}
            >
              {collectionId}
            </Text>
          </Title>

          {manufacturer && (
            <Box>
              <Title fw={500} display="inline" order={3}>
                Manufacturer:&nbsp;
              </Title>
              <Title c="dark.3" fw={400} display="inline" order={3}>
                {`${manufacturer.name}${manufacturer.city ? `, ${manufacturer.city}` : ''}`}
                {isAdmin && <ManufacturerEdit barometer={barometer} />}
              </Title>
            </Box>
          )}

          {dating && (
            <Box>
              <Title fw={500} display="inline" order={3}>
                Dating:&nbsp;
              </Title>
              <Title c="dark.3" fw={400} display="inline" order={3}>
                {dating}
                {isAdmin && <TextFieldEdit barometer={barometer} property="dating" />}
              </Title>
            </Box>
          )}

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
              </Title>
            </Box>
          )}

          <Condition
            condition={condition}
            editButton={isAdmin && <ConditionEdit barometer={barometer} />}
          />

          {description && (
            <>
              <Divider
                mx="lg"
                my="lg"
                {...(isAdmin && {
                  label: <DescriptionEdit barometer={barometer} />,
                  labelPosition: 'right',
                })}
              />

              <Spoiler
                maxHeight={120}
                showLabel="Show more"
                hideLabel="Hide"
                styles={{ control: { color: '#242424', fontWeight: 600 } }}
              >
                {description.split('\n').map((paragraph, i) => (
                  <Text mb="md" key={i}>
                    {paragraph}
                  </Text>
                ))}
              </Spoiler>
            </>
          )}
        </Box>
      </Container>
    )
  } catch (error) {
    return (
      <ShowError message={error instanceof Error ? error.message : 'Error fetching barometer'} />
    )
  }
}

export async function generateStaticParams() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute)
  const barometers: IBarometer[] = await res.json()

  return barometers.map(({ slug }) => ({
    slug,
  }))
}
