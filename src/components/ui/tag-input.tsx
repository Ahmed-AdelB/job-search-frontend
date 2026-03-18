"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TagInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value = [], onChange, placeholder = "Add item and press Enter", className, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault()
        if (!value.includes(inputValue.trim())) {
          onChange([...value, inputValue.trim()])
          setInputValue("")
        }
      }
    }

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove))
    }

    return (
      <div className={cn("flex flex-wrap gap-2 rounded-lg border border-input bg-transparent p-2.5", className)}>
        {value.map((tag) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary"
          >
            <span>{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => removeTag(tag)}
              className="h-4 w-4 p-0 hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent px-0 py-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          {...props}
        />
      </div>
    )
  }
)
TagInput.displayName = "TagInput"

export { TagInput }
