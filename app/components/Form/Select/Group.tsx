"use client"

import { useId, type FC } from "react"
import type { SelectGroupProps } from "./types"
import { cn } from "@/lib/cn"

export const SelectGroup: FC<SelectGroupProps> = ({ className, label, children, ...props }) => {
  const generatedId = useId()
  const labelId = `${generatedId}-label`

  return (
    <li
      {...props}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={cn("list-none py-1", className)}
    >
      {label ? (
        <span id={labelId} className="block px-2 pb-1 text-xs font-semibold text-foreground/60">
          {label}
        </span>
      ) : null}
      <ul className="flex list-none flex-col gap-0.5 p-0 m-0">{children}</ul>
    </li>
  )
}

