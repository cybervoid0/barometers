'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Center, CenterProps, Tabs, Text, useComputedColorScheme } from '@mantine/core'
import dynamic from 'next/dynamic'
import styles from './tabs.module.scss'
import { menuData, isSingleMenuItem } from '../menu'

const WideScreenTabs = (props: CenterProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const scheme = useComputedColorScheme()

  const selectTab = (val: string | null) => {
    const index = Number(val ?? 0)
    const menuItem = menuData[index]
    if (isSingleMenuItem(menuItem)) {
      router.push(menuItem.link)
    }
  }
  return (
    <Center {...props} className={styles.container}>
      <Tabs value={pathname} onChange={selectTab}>
        <Tabs.List className={styles.list}>
          {menuData.map((menuitem, i) => (
            <Tabs.Tab className={styles[`tab-${scheme}`]} value={String(i)} key={menuitem.id}>
              <Text className={styles.text}>{menuitem.label}</Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
    </Center>
  )
}
export default dynamic(() => Promise.resolve(WideScreenTabs), { ssr: true })
