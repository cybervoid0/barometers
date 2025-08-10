'use client'

export default function Error({ error }: { error: Error }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="max-w-80 text-xs text-destructive">{error.message}</p>
      </div>
    </div>
  )
}
