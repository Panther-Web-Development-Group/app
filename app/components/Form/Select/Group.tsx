 "use client"
import { useId, type FC } from "react"
import type { SelectGroupProps } from "./types"
import { cn } from "@/lib/cn"

export const SelectGroup: FC<SelectGroupProps> = ({ className, label, children, ...props }) => {
  const generatedId = useId()
  const labelId = `${generatedId}-label`

  return (
    <div {...props} role="group" aria-labelledby={label ? labelId : undefined} className={cn("py-1", className)}>
      {label ? (
        <div id={labelId} className="px-2 pb-1 text-xs font-semibold text-foreground/60">
          {label}
        </div>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

