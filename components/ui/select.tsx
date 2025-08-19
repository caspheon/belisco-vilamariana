import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  onSelect?: (value: string) => void
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export interface SelectValueProps {
  placeholder?: string
  className?: string
}

export function Select({ value, onValueChange, children, placeholder, className }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const selectRef = React.useRef<HTMLDivElement>(null)
  
  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }
  
  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  // Hook para detectar clique externo
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  return (
    <div className={cn("relative", className)} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white shadow-sm ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedValue ? "text-white" : "text-gray-400"}>
          {selectedValue || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-600 bg-gray-800 shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onSelect: handleSelect,
              })
            }
            return child
          })}
        </div>
      )}
    </div>
  )
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  return <div className={className}>{children}</div>
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  return <span className={className}>{placeholder}</span>
}

export function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div className={cn("max-h-60 overflow-auto p-1", className)}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className, onSelect, ...props }: SelectItemProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150",
        className
      )}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </div>
  )
}
