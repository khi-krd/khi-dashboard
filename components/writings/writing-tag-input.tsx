"use client"

import { ProjectTagInput } from "@/components/projects/project-tag-input"
import { cn } from "@/lib/utils"

export function WritingTagInput({
  value,
  onChange,
  placeholder,
  variant = "solid",
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  variant?: "solid" | "dashed"
}) {
  return (
    <ProjectTagInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      chipClassName={cn(
        variant === "solid"
          ? "bg-muted text-foreground border border-border"
          : "bg-transparent text-muted-foreground border border-dashed border-border",
      )}
    />
  )
}
