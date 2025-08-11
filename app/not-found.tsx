export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <h2 className="font-cinzel text-secondary text-6xl">404</h2>
        <h2 className="font-cinzel text-muted-foreground text-4xl tracking-wide">Not Found</h2>
        <p className="text-muted-foreground text-sm">Requested page is not available</p>
      </div>
    </div>
  )
}
