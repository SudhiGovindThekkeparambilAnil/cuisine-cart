import * as React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

// Define the variants and styles for the TextArea component using `cva`
const textAreaVariants = cva(
  "flex items-start justify-start text-black rounded-md border p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-white placeholder-gray-500",
        outline: "border-gray-300 bg-transparent placeholder-gray-500 focus:ring-primary-500",
        ghost: "border-transparent bg-transparent placeholder-gray-400 focus:ring-primary-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textAreaVariants> {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textAreaVariants({ variant }), className)}
      {...props}
    />
  )
);

TextArea.displayName = "TextArea";

export { TextArea };