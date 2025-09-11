import 'server-only'

import { getAllBarometers } from '@/lib/barometers/queries'
import { getConditions } from '@/lib/conditions/queries'
import type { DynamicOptions } from '@/types'
import { DocumentForm } from './document-form'

export const dynamic: DynamicOptions = 'force-dynamic'

export default async function AddDocument() {
  const conditions = await getConditions()
  const allBarometers = await getAllBarometers()
  return (
    <div className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new document</h3>
      <DocumentForm conditions={conditions} allBarometers={allBarometers} />
    </div>
  )
}
