import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-700",
          className
        )}
        {...props}
      >
        <div
          className="h-full transition-all duration-300 ease-in-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage >= 80 ? '#ef4444' : percentage >= 60 ? '#f59e0b' : '#10b981'
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
