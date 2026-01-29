import 'server-only'

import { getAllBarometers } from '@/server/barometers/queries'
import { getConditions } from '@/server/conditions/queries'
import { DocumentForm } from './document-form'

export default async function AddDocument() {
  const conditions = await getConditions()
  const allBarometers = await getAllBarometers()
  return (
    <article className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new document</h3>
      <DocumentForm conditions={conditions} allBarometers={allBarometers} />
    </article>
  )
}
