import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
  }
export function CardTitle({ className, children, ...props }: CardTitleProps) {
    return (
      <div className={cn("text-xl font-semibold", className)} {...props}>
        {children}
      </div>
    );
  }

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-xl border bg-white p-4 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-2 text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("text-sm text-gray-700", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("mt-4 flex justify-end", className)} {...props}>
      {children}
    </div>
  );
}