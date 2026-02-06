"use client"

import { FC, ReactNode, Children, isValidElement, cloneElement } from "react"
import { cn } from "@/lib/cn"
import { Card, CardProps } from "./index"

export interface CardGroupItem extends Omit<CardProps, "className"> {
  id?: string
}

export interface CardGroupProps {
  /**
   * Array of card items to display (alternative to children)
   */
  cards?: CardGroupItem[]
  
  /**
   * Card components as children (alternative to cards prop)
   */
  children?: ReactNode
  
  /**
   * Number of columns in the grid
   * @default 3
   */
  columns?: 1 | 2 | 3 | 4
  
  /**
   * Gap between cards
   * @default "md"
   */
  gap?: "sm" | "md" | "lg"
  
  /**
   * Title for the card group (optional)
   */
  title?: string
  
  /**
   * Description for the card group (optional)
   */
  description?: string
  
  /**
   * Custom className for the container
   */
  className?: string
  
  /**
   * Custom className for the grid
   */
  gridClassName?: string
  
  /**
   * Whether cards should have equal height
   * @default true
   */
  equalHeight?: boolean
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

export const CardGroup: FC<CardGroupProps> = ({
  cards,
  children,
  columns = 3,
  gap = "md",
  title,
  description,
  className,
  gridClassName,
  equalHeight = true,
}) => {
  // Check if we have cards data or children
  const hasCards = cards && cards.length > 0
  const hasChildren = children && Children.count(children) > 0

  if (!hasCards && !hasChildren) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-foreground/75">{description}</p>
          )}
        </div>
      )}

      <div
        className={cn(
          "grid",
          columnClasses[columns],
          gapClasses[gap],
          equalHeight && "items-stretch",
          gridClassName
        )}
      >
        {hasCards
          ? cards.map((card, index) => (
              <Card
                key={card.id || index}
                title={card.title}
                body={card.body}
                image={card.image}
                images={card.images}
                link={card.link}
                className={cn(equalHeight && "h-full flex flex-col")}
              >
                {card.children}
              </Card>
            ))
          : Children.map(children, (child, index) => {
              if (isValidElement(child)) {
                // Clone the child and add className for equal height if needed
                return cloneElement(child, {
                  key: child.key || index,
                  className: cn(
                    child.props.className,
                    equalHeight && "h-full flex flex-col"
                  ),
                } as any)
              }
              return child
            })}
      </div>
    </div>
  )
}
