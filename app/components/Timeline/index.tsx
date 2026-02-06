"use client"

import { FC, ReactNode } from "react"
import { cn } from "@/lib/cn"
import Link from "next/link"

export interface TimelineItem {
  id?: string
  date: string
  title: string
  description?: string
  content?: ReactNode
  icon?: ReactNode
  image?: {
    src: string
    alt?: string
  }
  link?: {
    href: string
    label?: string
  }
  variant?: "default" | "success" | "warning" | "error" | "info"
}

export interface TimelineProps {
  /**
   * Array of timeline items
   */
  items: TimelineItem[]
  
  /**
   * Timeline orientation
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal"
  
  /**
   * Show connecting line between items
   * @default true
   */
  showLine?: boolean
  
  /**
   * Show dates
   * @default true
   */
  showDates?: boolean
  
  /**
   * Custom className for the container
   */
  className?: string
  
  /**
   * Custom className for items
   */
  itemClassName?: string
}

const variantColors = {
  default: "bg-accent border-accent",
  success: "bg-green-500 border-green-500",
  warning: "bg-yellow-500 border-yellow-500",
  error: "bg-red-500 border-red-500",
  info: "bg-blue-500 border-blue-500",
}

export const Timeline: FC<TimelineProps> = ({
  items,
  orientation = "vertical",
  showLine = true,
  showDates = true,
  className,
  itemClassName,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className={cn("rounded-lg border border-(--pw-border) bg-secondary/20 p-6 text-center", className)}>
        <p className="text-sm text-foreground/75">No timeline items available.</p>
      </div>
    )
  }

  if (orientation === "horizontal") {
    return (
      <div className={cn("relative", className)}>
        {showLine && (
          <div className="absolute left-0 right-0 top-8 h-0.5 bg-(--pw-border)" />
        )}
        <div className="relative flex gap-8 overflow-x-auto pb-8">
          {items.map((item, index) => {
            const variant = item.variant || "default"
            const iconColor = variantColors[variant]
            
            return (
              <div
                key={item.id || index}
                className={cn("flex min-w-[200px] flex-col items-center", itemClassName)}
              >
                {/* Icon/Image */}
                <div className={cn(
                  "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-background",
                  iconColor
                )}>
                  {item.icon ? (
                    <div className="text-white">{item.icon}</div>
                  ) : item.image ? (
                    <img
                      src={item.image.src}
                      alt={item.image.alt || item.title}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-current" />
                  )}
                </div>
                
                {/* Content */}
                <div className="mt-4 w-full space-y-2 text-center">
                  {showDates && (
                    <div className="text-xs font-medium text-foreground/70">
                      {item.date}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-foreground/75">
                      {item.description}
                    </p>
                  )}
                  {item.content}
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      {item.link.label || "Learn more"}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical timeline (default)
  return (
    <div className={cn("relative", className)}>
      {showLine && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-(--pw-border)" />
      )}
      <div className="space-y-8">
        {items.map((item, index) => {
          const variant = item.variant || "default"
          const iconColor = variantColors[variant]
          const isLast = index === items.length - 1
          
          return (
            <div
              key={item.id || index}
              className={cn("relative flex gap-4", itemClassName)}
            >
              {/* Icon/Image */}
              <div className="relative z-10 flex-shrink-0">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background",
                  iconColor
                )}>
                  {item.icon ? (
                    <div className="text-white">{item.icon}</div>
                  ) : item.image ? (
                    <img
                      src={item.image.src}
                      alt={item.image.alt || item.title}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-current" />
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
                <div className="space-y-2">
                  {showDates && (
                    <div className="text-xs font-medium text-foreground/70">
                      {item.date}
                    </div>
                  )}
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm leading-6 text-foreground/75">
                      {item.description}
                    </p>
                  )}
                  {item.content && (
                    <div className="text-sm text-foreground/80">
                      {item.content}
                    </div>
                  )}
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="inline-block text-sm font-medium text-accent hover:underline"
                    >
                      {item.link.label || "Learn more"} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
