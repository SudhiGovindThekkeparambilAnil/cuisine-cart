import { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: ReactNode;
}

export const DialogContent = ({ children }: DialogContentProps) => {
  return <div className="space-y-4">{children}</div>;
};

interface DialogHeaderProps {
  children: ReactNode;
}

export const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <div className="text-xl font-semibold">{children}</div>;
};

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return <div className={`mt-4 flex justify-end ${className}`}>{children}</div>;
};

interface DialogTitleProps {
  children: ReactNode;
}

export const DialogTitle = ({ children }: DialogTitleProps) => {
  return <div className="text-xl font-semibold">{children}</div>;
};