import {
  type FC
} from "react"
import { LabelProps } from "./types"
import { cn } from "@/lib/cn"

export const Label: FC<LabelProps> = ({
  children,
  className,
  name,
  icon,
  iconClassName,
  ...props
}) => {
  return (
    <label 
      {...props} 
      className={cn("flex gap-2", className)}
      data-name={name}>
      {icon && <span className={cn(iconClassName)}>{icon}</span>}
      {name && <span className="sr-only">{name}</span>}
      <div className="flex items-center gap-2">{children}</div>
    </label>
  )
}