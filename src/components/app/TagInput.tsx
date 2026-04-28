"use client"

import { useState, KeyboardEvent } from "react"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ value, onChange, placeholder = "Add another", className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [focused, setFocused] = useState(false)

  function addTag() {
    const t = inputValue.trim()
    if (!t) return
    if (!value.includes(t)) onChange([...value, t])
    setInputValue("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        className
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-2.5 pr-1 py-0.5 text-xs font-medium transition-colors hover:border-foreground/30"
        >
          <span className="size-1 rounded-full bg-primary" />
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full size-4 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-dashed pl-2 pr-1 py-0.5 transition-colors",
          focused ? "border-foreground/40 bg-muted/40" : "border-border"
        )}
      >
        <Plus className="size-3 text-muted-foreground" />
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            addTag()
          }}
          placeholder={placeholder}
          className="bg-transparent outline-none text-xs h-6 w-24 placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
