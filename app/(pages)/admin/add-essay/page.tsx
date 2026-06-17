import 'server-only'

import { EssayForm } from './essay-form'

export default function AddEssay() {
  return (
    <article className="mx-auto max-w-lg">
      <h3 className="mt-6 mb-10">Add new essay</h3>
      <EssayForm />
    </article>
  )
}
