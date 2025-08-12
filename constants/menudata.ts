import { AccessRole } from '@prisma/client'
import { getCategories } from '@/services'
import { FrontRoutes } from './routes-front'
import type { MenuItem } from '@/types'

export async function getMenuData(): Promise<MenuItem[]> {
  const categories = await getCategories()
  return [
    {
      id: 0,
      label: 'Home',
      link: '/',
    },
    {
      id: 1,
      label: 'Collection',
      link: '/collection',
      children: categories.map(cat => ({
        id: cat.id,
        link: FrontRoutes.Categories + cat.name.toLocaleLowerCase(),
        label: cat.label,
      })),
    },
    {
      id: 2,
      label: 'Brands',
      link: '/brands',
    },
    {
      id: 3,
      label: 'History',
      link: '/history',
    },
    {
      id: 4,
      label: 'About',
      link: '/about',
    },
    {
      id: 10,
      label: 'Admin',
      link: '/admin',
      visibleFor: AccessRole.ADMIN,
    },
  ]
}
