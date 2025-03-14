import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white shadow-md rounded-lg p-6 border border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// CardHeader Component
export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-b border-gray-200 pb-4", className)}>
      {children}
    </div>
  );
}

// CardContent Component
export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  );
}

// CardFooter Component
export function CardFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex space-x-2 mt-4", className)}>
      {children}
    </div>
  );
}