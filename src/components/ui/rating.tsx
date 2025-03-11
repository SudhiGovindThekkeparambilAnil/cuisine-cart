import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
  value: number
  max?: number
  className?: string
}

export function Rating({ value, max = 5, className }: RatingProps) {
  return (
    <div className={cn("flex", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < value ? "fill-[#F39C12] text-[#F39C12]" : "fill-none text-gray-300")}
        />
      ))}
    </div>
  )
}

