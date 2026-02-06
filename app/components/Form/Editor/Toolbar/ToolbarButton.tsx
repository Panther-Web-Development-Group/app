"use client"

import { Button } from "@/app/components/Button"
import { cn } from "@/lib/cn"
import { type ReactNode } from "react"

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  children: ReactNode
  title?: string
  disabled?: boolean
  className?: string
  variant?: "default" | "icon" | "text"
  size?: "sm" | "md"
}

export function ToolbarButton({
  onClick,
  isActive = false,
  children,
  title,
  disabled = false,
  className,
  variant = "icon",
  size = "md",
}: ToolbarButtonProps) {
  const sizeClasses = {
    sm: "h-7 w-7 p-1.5",
    md: "h-8 w-8 p-2",
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={isActive}
      disabled={disabled}
      variant="ghost"
      className={cn(
        "relative rounded-md transition-all duration-150",
        "hover:bg-foreground/5 dark:hover:bg-foreground/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-1",
        "active:scale-95",
        isActive &&
          "bg-foreground/10 dark:bg-foreground/20 text-foreground shadow-sm",
        !isActive && "text-foreground/70",
        disabled && "opacity-40 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
    >
      <span className="flex items-center justify-center">{children}</span>
      {isActive && (
        <span
          className="absolute inset-0 rounded-md ring-1 ring-foreground/10 dark:ring-foreground/20"
          aria-hidden
        />
      )}
    </Button>
  )
}
