"use client"

import { FC, forwardRef } from "react"
import type { ButtonProps } from "./types"
import { buttonVariants } from "./variants"
import { cn } from "@/lib/cn"

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
