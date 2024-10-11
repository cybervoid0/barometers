import { type Metadata } from 'next'
import { Container, Title, Text, Spoiler, Box, Divider } from '@mantine/core'
import { IBarometer } from '@/models/barometer'
import {
  barometersApiRoute,
  googleStorageImagesFolder,
  barometerRoute,
  twitterAccount,
} from '@/app/constants'
import { ShowError } from '@/app/components/show-error'
import { ImageCarousel } from './carousel'
import { Condition } from './condition'

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

export default async function BarometerItem({ params: { slug } }: BarometerItemProps) {
  try {
    const { name, images, description, manufacturer, dating, dimensions, condition }: IBarometer =
      await fetchBarometer(slug)

    return (
      <Container pt={{ base: 'none', sm: '5rem' }} size="xl">
        <Box px={{ base: 'none', sm: 'xl' }} pb={{ base: 'xl', sm: '5rem' }}>
          <ImageCarousel images={images?.map(image => googleStorageImagesFolder + image) ?? []} />
          <Title fw={500} mt={{ base: 'lg', sm: '5rem' }} mb="md" tt="capitalize">
            {name}
          </Title>

          {manufacturer && (
            <Box>
              <Title fw={500} display="inline" order={3}>
                Manufacturer:&nbsp;
              </Title>
              <Title c="dark.3" fw={400} display="inline" order={3}>
                {manufacturer.name}, {manufacturer.city}
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

          <Condition condition={condition} />

          {description && (
            <>
              <Divider mx="lg" my="lg" />

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
