import { Box, Title } from '@mantine/core'
import { HeadingImage } from './components/heading-image'

export default function HomePage() {
  return (
    <>
      <HeadingImage />
      <Box p={{ base: 'sm', md: 'xl' }}>
        <Title>Welcome to Leo&apos;s Barometers Collection</Title>
      </Box>
    </>
  )
}
