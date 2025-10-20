import { AlertTriangle, FilePlus2, FileText, Package, Plus, ShoppingBag, Store } from 'lucide-react'
import Link from 'next/link'
import { Route } from '@/constants/routes'

const sx = {
  link: 'text-foreground hover:text-primary flex w-fit items-center gap-2 transition-colors',
  icon: 'h-4 w-4',
}
const linkStyle =
  'text-foreground hover:text-primary flex w-fit items-center gap-2 transition-colors'
const iconStyle = 'h-4 w-4'

export default function Admin() {
  return (
    <article className="p-6">
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Collection</h2>
          <div className="space-y-4">
            <Link href={Route.AddBarometer} className={sx.link}>
              <Plus className={iconStyle} />
              Add new barometer
            </Link>
            <Link href={Route.AddBrand} className={linkStyle}>
              <Store className={iconStyle} />
              Add new brand
            </Link>
            <Link href={Route.AddDocument} className={linkStyle}>
              <FilePlus2 className={iconStyle} />
              Add new document
            </Link>
            <Link href={Route.Documents} className={linkStyle}>
              <FileText className={iconStyle} />
              View Documents
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Shop</h2>
          <div className="space-y-4">
            <Link href={Route.AddProduct} className={linkStyle}>
              <Package className={iconStyle} />
              Add new product
            </Link>
            <Link href={Route.Shop} className={linkStyle}>
              <ShoppingBag className={iconStyle} />
              View Shop
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Reports</h2>
          <div className="space-y-4">
            <Link href={Route.Reports} className={linkStyle}>
              <AlertTriangle className={iconStyle} />
              View Inaccuracy Reports
            </Link>
          </div>
        </section>
      </div>
    </article>
  )
}
