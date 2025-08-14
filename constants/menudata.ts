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
      link: FrontRoutes.Home,
    },
    {
      id: 1,
      label: 'Foundation',
      link: FrontRoutes.Foundation,
      children: [
        {
          id: 6,
          label: 'Foundation',
          link: FrontRoutes.Foundation,
        },
        {
          id: 7,
          label: 'Donators',
          link: FrontRoutes.Donators,
        },
      ],
    },
    {
      id: 2,
      label: 'Collection',
      link: '/collection',
      children: categories.map(cat => ({
        id: cat.id,
        link: FrontRoutes.Categories + cat.name.toLocaleLowerCase(),
        label: cat.label,
      })),
    },
    {
      id: 3,
      label: 'Brands',
      link: FrontRoutes.Brands,
    },
    {
      id: 4,
      label: 'About',
      link: FrontRoutes.About,
    },
    {
      id: 5,
      label: 'Admin',
      link: FrontRoutes.Admin,
      visibleFor: AccessRole.ADMIN,
    },
  ]
}
