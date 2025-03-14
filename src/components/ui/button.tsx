import * as React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

// Define button variants with the "destructive" variant added
const buttonVariants = cva(
  "flex items-center justify-center text-black px-4 py-2 rounded-full transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#E47D02] via-[#FF9A1F] to-[#F4A343] hover:opacity-90",
        outline: "border border-gray-300 bg-transparent text-black hover:bg-gray-100",
        ghost: "text-gray-700 hover:bg-gray-200",
        destructive: "bg-red-600 text-white hover:bg-red-700", 
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
      asChild?: boolean;
    }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };