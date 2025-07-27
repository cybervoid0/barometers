'use client'

import { useState, useEffect, Key } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Center, CenterProps, Tabs, Text, Menu, Anchor, Box } from '@mantine/core'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AccessRole } from '@prisma/client'
import { menuData } from '@/utils/menudata'
import { FrontRoutes } from '@/utils/routes-front'
import { isAdmin } from '../../is-admin'
import { CategoryListDTO } from '@/app/types'

interface Props extends CenterProps {
  categories: CategoryListDTO
}

const WideScreenTabs = ({ className, categories = [], ...props }: Props) => {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(-1)
  // opens menu from the tab
  const [opened, setOpened] = useState<Record<number, boolean>>({})
  const onMenuChange = (index: number, state: boolean) =>
    setOpened(old => ({ ...old, [index]: state }))

  const selectTab = (val: string | null) => {
    const index = Number(val ?? 0)
    const menuItem = menuData[index]
    if (!menuItem) return
    if (menuItem.label !== 'Collection') router.push(`/${menuItem.link}`)
  }

  // set active tab when the router path changes
  useEffect(() => {
    const rootPath: string | undefined = pathname.split('/')[1]
    const index = menuData.findIndex(item => item.link === rootPath)
    setActiveTab(index)
  }, [pathname])

  return (
    <Center component="nav" {...props}>
      <Tabs value={String(activeTab)} onChange={selectTab}>
        <Tabs.List className="before:!content-none">
          {menuData
            .filter(
              ({ visibleFor }) =>
                typeof visibleFor === 'undefined' ||
                (isAdmin(session) && visibleFor === AccessRole.ADMIN),
            )
            .map((menuitem, i) => {
              const renderTab = (key?: Key) => (
                <Tabs.Tab
                  className="!border-b data-[active]:!border-b-neutral-500"
                  value={String(i)}
                  key={key}
                  onClick={() => {
                    // close opened menu
                    if (opened[i]) setOpened(old => ({ ...old, [i]: false }))
                  }}
                >
                  <Text size="xs" tt="uppercase" fw={600} lts=".2rem">
                    {menuitem.label}
                  </Text>
                </Tabs.Tab>
              )
              return menuitem.label === 'Collection' ? (
                <Menu
                  trigger="click-hover"
                  menuItemTabIndex={0}
                  shadow="xl"
                  offset={0}
                  loop={false}
                  key={menuitem.id}
                  opened={opened[i]}
                  onChange={state => onMenuChange(i, state)}
                >
                  <Menu.Target>{renderTab()}</Menu.Target>
                  <Menu.Dropdown>
                    {categories.map(({ label, id, name }) => (
                      <Anchor
                        key={id}
                        href={FrontRoutes.Categories + name.toLocaleLowerCase()}
                        component={Link}
                        c="inherit"
                        underline="never"
                      >
                        <Menu.Item>
                          <Box px="xs">{label}</Box>
                        </Menu.Item>
                      </Anchor>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              ) : (
                renderTab(menuitem.id)
              )
            })}
        </Tabs.List>
      </Tabs>
    </Center>
  )
}
export default dynamic(() => Promise.resolve(WideScreenTabs), { ssr: true })
