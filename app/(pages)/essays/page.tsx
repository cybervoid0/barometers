import 'server-only'

import type { Metadata } from 'next'
import { getAllEssays } from '@/server/essays/queries'
import { EssayCard } from './essay-card'

const INTRO =
  'I write occasional popular-science / analytical essays on antique meteorological instruments — their mechanisms and materials, the slow chemistry of ageing metals and patina, and the craft of conservation and restoration, with the odd detour into collecting itself. These aren’t peer-reviewed papers; they’re the observations of a practising collector and restorer, grounded in instruments from my own collection and, wherever possible, in cited sources.'

export const metadata: Metadata = {
  title: 'Essays',
  description:
    'Popular-science and analytical essays on antique meteorological instruments — mechanisms, materials, conservation, and collecting.',
}

export default async function EssaysPage() {
  const essays = await getAllEssays()
  return (
    <article className="mt-6">
      <header className="mb-8 max-w-3xl">
        <h2 className="text-secondary tracking-tight">Essays</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{INTRO}</p>
      </header>

      {essays.length === 0 ? (
        <p className="text-muted-foreground">No essays published yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {essays.map(essay => (
            <li key={essay.id} className="list-none">
              <EssayCard essay={essay} />
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
