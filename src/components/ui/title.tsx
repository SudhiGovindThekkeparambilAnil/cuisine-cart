import { cn } from "@/lib/utils";

export function Title({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-2xl font-bold text-gray-900", className)} {...props}>
      {children}
    </h2>
  );
}