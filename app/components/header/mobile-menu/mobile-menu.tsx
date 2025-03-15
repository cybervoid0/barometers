import React, { FC, useState, Fragment } from 'react'
import {
  Drawer,
  DrawerProps,
  Box,
  ActionIcon,
  Stack,
  Anchor,
  Collapse,
  List,
  UnstyledButton,
  Text,
  Divider,
  Group,
  Center,
} from '@mantine/core'
import Link from 'next/link'
import * as motion from 'framer-motion/client'
import { IconChevronRight, IconAt, IconBrandInstagram } from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import { AccessRole } from '@prisma/client'
import { instagram, email } from '@/utils/constants'
import { categoriesRoute } from '@/utils/routes-front'
import { menuData } from '@/utils/menudata'
import { useBarometers } from '@/app/hooks/useBarometers'
import { isAdmin } from '../../is-admin'

export const MobileMenu: FC<DrawerProps> = props => {
  const { data: session } = useSession()
  const [opened, setOpened] = useState<Record<number, boolean>>({})
  const toggle = (index: number) => setOpened(old => ({ ...old, [index]: !old[index] }))
  const { categories } = useBarometers()

  return (
    <Drawer
      size="80%"
      transitionProps={{
        duration: 500,
      }}
      styles={{
        content: {},
        body: {
          padding: 0,
          height: 'calc(100% - 4rem)',
        },
      }}
      {...props}
    >
      <Stack h="100%" justify="space-between">
        {/* Menu */}
        <Box
          component={motion.div}
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <List px="xl" listStyleType="none">
            {menuData
              .filter(
                ({ visibleFor }) =>
                  typeof visibleFor === 'undefined' ||
                  (isAdmin(session) && visibleFor === AccessRole.ADMIN),
              )
              .map((outer, i, arr) => (
                <Fragment key={outer.id}>
                  {outer.label === 'Collection' ? (
                    <>
                      <List.Item py="md">
                        <UnstyledButton onClick={() => toggle(i)}>
                          <Group gap="sm">
                            <Text size="md" tt="uppercase" lts="0.15rem" fw={500}>
                              {outer.label}
                            </Text>
                            <Center
                              component={motion.div}
                              animate={{ rotate: opened[i] ? 90 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <IconChevronRight />
                            </Center>
                          </Group>
                        </UnstyledButton>
                      </List.Item>
                      <Collapse transitionDuration={500} in={opened[i]}>
                        <List px="xl" listStyleType="none">
                          {categories.data.map(({ name, label, id }) => (
                            <List.Item pb="sm" key={id}>
                              <Anchor
                                c="inherit"
                                component={Link}
                                href={categoriesRoute + name}
                                onClick={props.onClose}
                              >
                                <Text size="md" tt="capitalize" lts="0.1rem" fw={400}>
                                  {label}
                                </Text>
                              </Anchor>
                            </List.Item>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  ) : (
                    <List.Item py="md">
                      <Anchor
                        c="inherit"
                        component={Link}
                        href={`/${outer.link}`}
                        onClick={props.onClose}
                      >
                        <Text size="md" tt="uppercase" lts="0.15rem" fw={500}>
                          {outer.label}
                        </Text>
                      </Anchor>
                    </List.Item>
                  )}
                  {i < arr.length - 1 && <Divider />}
                </Fragment>
              ))}
          </List>
        </Box>

        {/* Footer */}
        <Box
          component={motion.div}
          initial={{ y: 70 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Divider />
          <Group h="4rem" align="center" justify="space-evenly">
            <Anchor aria-label="Instagram" target="_blank" href={instagram} lh={0}>
              <ActionIcon variant="default" size="sm" bd="none">
                <IconBrandInstagram size="100%" />
              </ActionIcon>
            </Anchor>
            <Anchor aria-label="Email" target="_blank" href={`mailto:${email}`} lh={0}>
              <ActionIcon variant="default" size="sm" bd="none">
                <IconAt size="100%" />
              </ActionIcon>
            </Anchor>
          </Group>
        </Box>
      </Stack>
    </Drawer>
  )
}
