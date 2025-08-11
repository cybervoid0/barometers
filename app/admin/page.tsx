import Link from 'next/link'
import { Plus, AlertTriangle } from 'lucide-react'
import { FrontRoutes } from '@/utils/routes-front'

export default function Admin() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <Link
          href={FrontRoutes.AddBarometer}
          className="text-foreground hover:text-primary flex w-fit items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add new barometer
        </Link>
        <Link
          href={FrontRoutes.Reports}
          className="text-foreground hover:text-primary flex w-fit items-center gap-2 transition-colors"
        >
          <AlertTriangle className="h-4 w-4" />
          View Inaccuracy Reports
        </Link>
      </div>
    </div>
  )
}
