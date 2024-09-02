'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Center, CenterProps, Tabs, Text, useMantineColorScheme } from '@mantine/core'
import styles from './tabs.module.scss'

const menuData = [
  {
    id: 1,
    text: 'Collection',
    link: '/collection',
  },
  {
    id: 2,
    text: 'History',
    link: '/history',
  },
  {
    id: 3,
    text: 'About',
    link: '/about',
  },
]

export const WideScreenTabs = (props: CenterProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { colorScheme } = useMantineColorScheme()
  return (
    <Center {...props} className={styles.container}>
      <Tabs value={pathname} onChange={value => router.push(value ?? '/')}>
        <Tabs.List className={styles.list}>
          {menuData.map(({ id, link, text }) => (
            <Tabs.Tab className={styles[`tab-${colorScheme}`]} value={link} key={id}>
              <Text className={styles.text}>{text}</Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
    </Center>
  )
}
