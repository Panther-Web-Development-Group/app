import {
  forwardRef
} from "react"
import type { InputProps } from "./types"
import { cn } from "@/lib/cn"

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input 
    ref={ref}
    {...props} 
    className={cn("h-10 w-full px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30", className)} />
))

Input.displayName = "Input"