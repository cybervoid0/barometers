export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <h2 className="font-cinzel text-6xl text-secondary">404</h2>
        <h2 className="font-cinzel text-4xl tracking-wide text-muted-foreground">Not Found</h2>
        <p className="text-sm text-muted-foreground">Requested page is not available</p>
      </div>
    </div>
  )
}
