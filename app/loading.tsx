export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="border-muted h-12 w-12 rounded-full border-4"></div>
          <div className="border-t-primary absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent"></div>
        </div>

        {/* Loading text with pulse animation */}
        <div className="flex items-center space-x-1">
          <span className="text-muted-foreground text-sm font-medium">Loading</span>
          <div className="flex space-x-1">
            <div className="bg-primary h-1 w-1 animate-pulse rounded-full"></div>
            <div className="animation-delay-200 bg-primary h-1 w-1 animate-pulse rounded-full"></div>
            <div className="animation-delay-400 bg-primary h-1 w-1 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
