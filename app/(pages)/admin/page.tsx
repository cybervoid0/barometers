import {
  AlertTriangle,
  BookOpen,
  Boxes,
  ClipboardList,
  Cog,
  ExternalLink,
  FilePlus2,
  FileText,
  Layers,
  LibraryBig,
  type LucideIcon,
  Newspaper,
  Package,
  PenLine,
  Plus,
  ShoppingBag,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Route } from '@/constants/routes'

interface AdminLink {
  href: string
  label: string
  icon: LucideIcon
}

interface AdminGroup {
  title: string
  description: string
  icon: LucideIcon
  links: AdminLink[]
}

const groups: AdminGroup[] = [
  {
    title: 'Collection',
    description: 'Barometers, brands & reference data',
    icon: LibraryBig,
    links: [
      { href: Route.AddBarometer, label: 'Add new barometer', icon: Plus },
      { href: Route.AddBrand, label: 'Add new brand', icon: Store },
      { href: Route.Materials, label: 'Manage materials', icon: Layers },
      { href: Route.Movements, label: 'Manage movement types', icon: Cog },
    ],
  },
  {
    title: 'Library',
    description: 'Documents, essays & ephemera',
    icon: BookOpen,
    links: [
      { href: Route.AddDocument, label: 'Add new document', icon: FilePlus2 },
      { href: Route.AddEssay, label: 'Add new essay', icon: PenLine },
      { href: Route.Documents, label: 'View documents', icon: FileText },
      { href: Route.Ephemera, label: 'View ephemera', icon: Newspaper },
    ],
  },
  {
    title: 'Shop',
    description: 'Products, storefront & orders',
    icon: ShoppingBag,
    links: [
      { href: Route.AddProduct, label: 'Add new product', icon: Package },
      { href: Route.AdminProducts, label: 'Manage products', icon: Boxes },
      { href: Route.AdminOrders, label: 'Manage orders', icon: ClipboardList },
      { href: Route.Shop, label: 'View shop', icon: ExternalLink },
    ],
  },
  {
    title: 'Reports',
    description: 'Community feedback on the catalogue',
    icon: AlertTriangle,
    links: [{ href: Route.Reports, label: 'Inaccuracy reports', icon: AlertTriangle }],
  },
]

export default function Admin() {
  return (
    <article className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => {
          const GroupIcon = group.icon
          return (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GroupIcon className="h-4 w-4 text-primary" />
                  {group.title}
                </CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {group.links.map(link => {
                  const LinkIcon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group -mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      {link.label}
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </article>
  )
}
