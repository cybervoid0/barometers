'use client'

import { Container, Group, Title, Tooltip, ActionIcon } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'
import { useSession, signOut } from 'next-auth/react'
import { FC, PropsWithChildren } from 'react'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { data } = useSession()

  const logOut = () => {
    signOut({
      callbackUrl: '/signin',
    })
  }
  return (
    <Container size="sm" py="xl">
      <Group align="center">
        <Title order={2}>Welcome, {data?.user?.name ?? 'Admin'}</Title>
        <Tooltip color="dark.2" label="Log out">
          <ActionIcon color="dark.3" onClick={logOut}>
            <IconLogout />
          </ActionIcon>
        </Tooltip>
      </Group>

      {children}
    </Container>
  )
}

export default Layout
