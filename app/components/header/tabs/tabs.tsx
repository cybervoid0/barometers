'use client'

import { useState, useEffect, Key } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Center,
  CenterProps,
  Tabs,
  Text,
  useComputedColorScheme,
  Menu,
  Anchor,
  Box,
} from '@mantine/core'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import sx from './tabs.module.scss'
import { menuData, hasChildren } from '../menudata'

const WideScreenTabs = ({ className, ...props }: CenterProps) => {
  const { status } = useSession()
  const isLoggedId = status === 'authenticated'
  const router = useRouter()
  const pathname = usePathname()
  const scheme = useComputedColorScheme()
  const [activeTab, setActiveTab] = useState(-1)
  // opens menu from the tab
  const [opened, setOpened] = useState<Record<number, boolean>>({})
  const onMenuChange = (index: number, state: boolean) =>
    setOpened(old => ({ ...old, [index]: state }))

  const selectTab = (val: string | null) => {
    const index = Number(val ?? 0)
    const menuItem = menuData[index]
    if (!menuItem) return
    if (!hasChildren(menuItem)) router.push(`/${menuItem.link}`)
  }

  // set active tab when the router path changes
  useEffect(() => {
    const rootPath: string | undefined = pathname.split('/')[1]
    const index = menuData.findIndex(item => item.link === rootPath)
    setActiveTab(index)
  }, [pathname])

  return (
    <Center component="nav" {...props} className={clsx(className, sx.container)}>
      <Tabs value={String(activeTab)} onChange={selectTab}>
        <Tabs.List className={sx.list}>
          {menuData
            .filter(
              ({ visibleFor }) =>
                typeof visibleFor === 'undefined' || (isLoggedId && visibleFor === 'Admin'),
            )
            .map((menuitem, i) => {
              const renderTab = (key?: Key) => (
                <Tabs.Tab className={sx[`tab-${scheme}`]} value={String(i)} key={key}>
                  <Text size="xs" tt="uppercase" fw={600} lts=".2rem">
                    {menuitem.label}
                  </Text>
                </Tabs.Tab>
              )
              return hasChildren(menuitem) ? (
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
                    {menuitem.children.map(submenu => (
                      <Anchor
                        key={submenu.id}
                        href={`/${menuitem.link}/${submenu.link}`}
                        component={Link}
                        c="inherit"
                        underline="never"
                      >
                        <Menu.Item>
                          <Box px="xs">{submenu.label}</Box>
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
