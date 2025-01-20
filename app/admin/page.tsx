import Link from 'next/link'
import { Container, Button, Stack } from '@mantine/core'
import { addBarometerRoute, viewReportsRoute } from '@/utils/routes-front'

export default function Admin() {
  return (
    <Container size="lg">
      <Stack gap="xs" w="15rem">
        <Link href={addBarometerRoute}>
          <Button fullWidth size="compact-sm">
            Add new barometer
          </Button>
        </Link>
        <Link href={viewReportsRoute}>
          <Button fullWidth size="compact-sm">
            View Inaccuracy Reports
          </Button>
        </Link>
      </Stack>
    </Container>
  )
}
