import 'server-only'

import { createMovement, deleteMovement, updateMovement } from '@/server/movements/actions'
import { getMovements } from '@/server/movements/queries'
import { ReferenceDataList } from '../_components/reference-data-list'

export default async function MovementsPage() {
  const movements = await getMovements()

  return (
    <article className="mx-auto max-w-2xl space-y-6 p-6">
      <h3 className="mt-6 mb-10">Movement Types</h3>
      <ReferenceDataList
        addLabel="Add new movement type"
        items={movements}
        onCreate={createMovement}
        onUpdate={updateMovement}
        onDelete={deleteMovement}
      />
    </article>
  )
}
