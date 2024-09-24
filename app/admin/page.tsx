'use client'

import { FC } from 'react'
import { Box, Title, Button } from '@mantine/core'
import { useSession, signOut } from 'next-auth/react'

export const Admin: FC = () => {
  const { data } = useSession()
  return (
    <Box ta="center">
      <Title mt="lg" order={2}>
        Welcome, {data?.user?.name ?? 'Admin'}
      </Title>
      <Button
        color="dark"
        variant="outline"
        mt="lg"
        onClick={() =>
          signOut({
            callbackUrl: '/signin',
          })
        }
      >
        Logout
      </Button>
    </Box>
  )
}
export default Admin
