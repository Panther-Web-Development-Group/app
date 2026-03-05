"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"

export interface StatItemProps {
  value: string | number
  label: string
  className?: string
}

const StatItem: FC<StatItemProps> = ({ value, label, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-secondary/30 bg-secondary/5 px-6 py-8 text-center",
      className
    )}
  >
    <span className="text-3xl font-bold text-accent md:text-4xl lg:text-5xl">
      {value}
    </span>
    <span className="mt-2 text-sm font-medium uppercase tracking-wider text-secondary-foreground/80">
      {label}
    </span>
  </div>
)

export interface StatisticsProps {
  children: React.ReactNode
  className?: string
}

const StatisticsRoot: FC<StatisticsProps> = ({ children, className }) => (
  <div
    className={cn(
      "grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4",
      className
    )}
  >
    {children}
  </div>
)

export const Statistics = Object.assign(StatisticsRoot, {
  Item: StatItem,
})
