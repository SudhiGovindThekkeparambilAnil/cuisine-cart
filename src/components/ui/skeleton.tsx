import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse bg-gray-300 rounded-md", className)} />;
  }