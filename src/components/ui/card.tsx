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