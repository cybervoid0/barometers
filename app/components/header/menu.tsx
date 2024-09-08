interface BaseMenuItem {
  id: number
  label: string
}
interface SingleMenuItem extends BaseMenuItem {
  link: string
}
interface MenuItemWithChildren extends BaseMenuItem {
  children: SingleMenuItem[]
  link?: never
}
// discriminated union
type MenuItem = SingleMenuItem | MenuItemWithChildren
export function isSingleMenuItem(menuItem: MenuItem): menuItem is SingleMenuItem {
  return 'link' in menuItem
}

export const menuData: MenuItem[] = [
  {
    id: 0,
    label: 'Home',
    link: '/collection',
  },
  {
    id: 1,
    label: 'Collection',
    children: [
      {
        id: 4,
        label: 'Mercury',
        link: '/mercury',
      },
      {
        id: 5,
        label: 'Aneroid',
        link: '/aneroid',
      },
      {
        id: 6,
        label: 'Recorders',
        link: '/recorders',
      },
      {
        id: 7,
        label: 'Watch-size',
        link: '/watch-size',
      },
      {
        id: 8,
        label: 'Bourdon',
        link: '/bourdon',
      },
      {
        id: 9,
        label: 'Forecasting',
        link: '/forecasting',
      },
    ],
  },
  {
    id: 2,
    label: 'History',
    link: '/history',
  },
  {
    id: 3,
    label: 'About',
    link: '/about',
  },
]
