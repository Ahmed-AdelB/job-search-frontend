"use client"

import * as React from "react"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
  }
>(({ className, value, onValueChange, disabled, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-2", className)}
    role="radiogroup"
    {...props}
  />
))
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    value?: string
  }
>(({ className, value, disabled, ...props }, ref) => {
  const id = React.useId()
  const [checked, setChecked] = React.useState(false)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={ref}
        type="radio"
        value={value}
        disabled={disabled}
        id={id}
        className={cn(
          "peer h-4 w-4 rounded-full border border-primary ring-offset-background transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => setChecked(e.target.checked)}
        {...props}
      />
      {checked && (
        <div className="absolute flex items-center justify-center w-4 h-4">
          <Circle className="h-2.5 w-2.5 fill-primary-foreground text-primary-foreground" />
        </div>
      )}
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
