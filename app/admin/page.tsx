import { AlertTriangle, FilePlus2, FileText, Plus, Store } from 'lucide-react'
import Link from 'next/link'
import { FrontRoutes } from '@/constants/routes-front'

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
      <div className="space-y-4">
        <Link href={FrontRoutes.AddBarometer} className={sx.link}>
          <Plus className={iconStyle} />
          Add new barometer
        </Link>
        <Link href={FrontRoutes.AddBrand} className={linkStyle}>
          <Store className={iconStyle} />
          Add new brand
        </Link>
        <Link href={FrontRoutes.AddDocument} className={linkStyle}>
          <FilePlus2 className={iconStyle} />
          Add new document
        </Link>
        <Link href={FrontRoutes.Documents} className={linkStyle}>
          <FileText className={iconStyle} />
          View Documents
        </Link>
        <Link href={FrontRoutes.Reports} className={linkStyle}>
          <AlertTriangle className={iconStyle} />
          View Inaccuracy Reports
        </Link>
      </div>
    </article>
  )
}
