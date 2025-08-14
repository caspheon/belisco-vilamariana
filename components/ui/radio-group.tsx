import * as React from "react"
import { cn } from "../../lib/utils"

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export interface RadioGroupItemProps {
  value: string
  id: string
  className?: string
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                onValueChange?.(e.target.value)
              }
            },
          })
        }
        return child
      })}
    </div>
  )
}

export function RadioGroupItem({ value, id, className, checked, onChange, ...props }: RadioGroupItemProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      className={cn(
        "h-4 w-4 border-gray-600 text-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}
