"use client"

import { FC } from "react"
import Link from "next/link"
import type { CardListProps, CardListItemProps } from "./types"
import { cardSlotVariants } from "./variants"
import { cn } from "@/lib/cn"

export const CardList: FC<CardListProps> = ({
  children,
  className,
  ...props
}) => {
  const { list } = cardSlotVariants()
  return (
    <ul {...props} className={cn(list(), "list-none", className)}>
      {children}
    </ul>
  )
}

export const CardListItem: FC<CardListItemProps> = ({
  icon,
  title,
  description,
  href,
  children,
  className,
  ...props
}) => {
  const { listItem, listItemLink } = cardSlotVariants()
  const content = (
    <>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
      {icon && (
        <span className="shrink-0 size-8 flex items-center justify-center rounded-md bg-foreground/5 text-foreground/70">
          {icon}
        </span>
      )}
      <span className="flex flex-col min-w-0">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-sm text-foreground/60">{description}</span>
        {children}
      </span>
    </>
  )

  return (
    <li {...props} className={cn(listItem(), className)}>
      {href ? <Link href={href} className={cn(listItemLink(), "block")}>{content}</Link> : content}
    </li>
  )
}
