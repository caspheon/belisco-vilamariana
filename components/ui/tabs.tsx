import * as React from "react"
import { cn } from "../../lib/utils"

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "")
  
  React.useEffect(() => {
    if (value) {
      setActiveTab(value)
    }
  }, [value])
  
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }
  
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child, {
              activeTab,
              onTabChange: handleTabChange,
            })
          } else if (child.type === TabsContent) {
            return React.cloneElement(child, {
              activeTab,
            })
          }
        }
        return child
      })}
    </div>
  )
}

export function TabsList({ children, className, activeTab, onTabChange }: TabsListProps & { activeTab?: string; onTabChange?: (value: string) => void }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-800 p-1 text-gray-400", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange,
          })
        }
        return child
      })}
    </div>
  )
}

export function TabsTrigger({ value, children, className, activeTab, onTabChange, ...props }: TabsTriggerProps & React.HTMLAttributes<HTMLButtonElement> & { activeTab?: string; onTabChange?: (value: string) => void }) {
  const isActive = activeTab === value
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
        isActive ? "bg-green-600 text-white shadow-lg" : "text-gray-200 hover:text-white hover:bg-gray-700",
        className
      )}
      onClick={() => onTabChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className, activeTab, ...props }: TabsContentProps & React.HTMLAttributes<HTMLDivElement> & { activeTab?: string }) {
  if (activeTab !== value) {
    return null
  }
  
  return (
    <div
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}
