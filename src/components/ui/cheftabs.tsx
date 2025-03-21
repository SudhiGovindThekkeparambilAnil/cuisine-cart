import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === TabsList
          ? React.cloneElement(child as React.ReactElement<TabsListProps>, {
              activeTab,
              setActiveTab,
            })
          : null
      )}
      {React.Children.map(children, (child) => {
        if (React.isValidElement<TabsContentProps>(child) && child.type === TabsContent) {
          return child.props.value === activeTab ? child : null;
        }
        return null;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
  className?: string;
}

export function TabsList({ children, activeTab, setActiveTab, className }: TabsListProps) {
  return (
    <div className={cn("flex space-x-2 bg-gray-100 p-1 rounded-lg", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === TabsTrigger
          ? React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
              activeTab,
              setActiveTab,
            })
          : null
      )}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-all",
        activeTab === value
          ? "bg-orange-500 text-white"
          : "bg-transparent text-gray-700 hover:bg-gray-200"
      )}
      onClick={() => setActiveTab?.(value)}>
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

//  FIX: Read the `value` prop to avoid the unused variable warning
export function TabsContent({ value, children }: TabsContentProps) {
  React.useEffect(() => {
    // This is a workaround to prevent TypeScript from flagging 'value' as unused
  }, [value]);

  return <div className="mt-4">{children}</div>;
}
