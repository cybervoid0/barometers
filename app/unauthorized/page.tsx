export default function Unauthorized() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <h2 className="font-cinzel text-secondary text-6xl">403</h2>
        <h2 className="font-cinzel text-muted-foreground text-4xl tracking-wide">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You don't have permission to access this page
        </p>
      </div>
    </div>
  )
}
