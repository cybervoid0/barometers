'use client'

export default function Error({ error }: { error: Error }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col">
        <h1 className="text-destructive text-2xl font-bold">Error</h1>
        <p className="text-destructive max-w-80 text-xs">{error.message}</p>
      </div>
    </div>
  )
}
