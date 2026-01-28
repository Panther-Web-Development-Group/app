import {
  type FC
} from "react"
import type { TextAreaProps } from "./types"
import { cn } from "@/lib/cn"

export const TextArea: FC<TextAreaProps> = ({ className, ...props }) => (
  <textarea 
    {...props} 
    className={cn("min-h-20 w-full px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30", className)} />
)