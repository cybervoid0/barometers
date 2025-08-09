export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted"></div>
          <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-primary"></div>
        </div>

        {/* Loading text with pulse animation */}
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-muted-foreground">Loading</span>
          <div className="flex space-x-1">
            <div className="h-1 w-1 animate-pulse rounded-full bg-primary"></div>
            <div className="animation-delay-200 h-1 w-1 animate-pulse rounded-full bg-primary"></div>
            <div className="animation-delay-400 h-1 w-1 animate-pulse rounded-full bg-primary"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
