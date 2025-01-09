import Link from 'next/link'
import { Anchor, Container, Button, Stack } from '@mantine/core'
import { addBarometerRoute, viewReportsRoute } from '../constants'

export default function Admin() {
  return (
    <Container size="lg">
      <Stack gap="xs" w="15rem">
        <Anchor c="dark" href={addBarometerRoute} component={Link}>
          <Button fullWidth size="compact-sm">
            Add new barometer
          </Button>
        </Anchor>
        <Anchor c="dark" href={viewReportsRoute} component={Link}>
          <Button fullWidth size="compact-sm">
            View Inaccuracy Reports
          </Button>
        </Anchor>
      </Stack>
    </Container>
  )
}
