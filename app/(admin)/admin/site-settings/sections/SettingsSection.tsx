"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

type SettingsSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-(--pw-border) bg-secondary/20 p-6",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-foreground/70">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}
