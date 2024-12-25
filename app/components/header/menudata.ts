import { AccessRole } from '@prisma/client'

interface MenuItem {
  id: number
  label: string
  link: string
  visibleFor?: AccessRole
}

export const menuData: MenuItem[] = [
  {
    id: 0,
    label: 'Home',
    link: '',
  },
  {
    id: 1,
    label: 'Collection',
    link: 'collection',
  },
  {
    id: 3,
    label: 'History',
    link: 'history',
  },
  {
    id: 4,
    label: 'About',
    link: 'about',
  },
  {
    id: 10,
    label: 'Admin',
    link: 'admin',
    visibleFor: AccessRole.ADMIN,
  },
]
