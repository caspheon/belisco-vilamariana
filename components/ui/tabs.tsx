import * as React from "react"
import { cn } from "../../lib/utils"

export interface TabsProps {
  value?: string
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

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(value || "")
  
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
          return React.cloneElement(child, {
            activeTab,
            onTabChange: handleTabChange,
          })
        }
        return child
      })}
    </div>
  )
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-800 p-1 text-gray-400", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={() => {
        const tabs = document.querySelector('[data-tabs]') as any
        if (tabs?.onTabChange) {
          tabs.onTabChange(value)
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className, ...props }: TabsContentProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}
