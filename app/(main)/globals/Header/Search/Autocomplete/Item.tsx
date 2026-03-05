"use client"

import { FC } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/cn"
import { useAutocomplete } from "./Context"
import type { SearchAutocompleteItemProps } from "../types"

export const SearchAutocompleteItem: FC<SearchAutocompleteItemProps> = ({
  className,
  href,
  image,
  imageAlt = "",
  title,
  description,
  onClick,
  children,
  ...props
}) => {
  const { getNextItemIndex, highlightedIndex, setHighlightedIndex, setIsOpen } = useAutocomplete()
  const itemIndex = getNextItemIndex()
  const isHighlighted = itemIndex === highlightedIndex

  const content = (
    <>
      {image && (
        <span className="shrink-0 size-10 rounded-md overflow-hidden bg-foreground/5">
          <Image
            src={image}
            alt={imageAlt}
            width={40}
            height={40}
            className="size-full object-cover"
          />
        </span>
      )}
      <span className="flex flex-col min-w-0">
        {title && <span className="font-medium truncate">{title}</span>}
        {description && (
          <span className="text-sm text-foreground/60 truncate">{description}</span>
        )}
        {children}
      </span>
    </>
  )

  const baseClassName = cn(
    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm",
    "text-foreground/90 hover:bg-foreground/8 hover:text-foreground",
    "transition-colors duration-150 cursor-pointer",
    isHighlighted && "bg-accent/15 text-foreground",
    className
  )

  const itemProps = {
    role: "option" as const,
    "aria-selected": isHighlighted,
    onMouseEnter: () => setHighlightedIndex(itemIndex),
  }

  const handleSelect = (e: React.MouseEvent) => {
    setIsOpen(false)
    onClick?.(e as React.MouseEvent<HTMLLIElement>)
  }

  if (href) {
    return (
      <li {...itemProps} {...props}>
        <Link href={href} className={baseClassName} onClick={handleSelect}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li
      {...itemProps}
      tabIndex={-1}
      className={baseClassName}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.(e as unknown as React.MouseEvent<HTMLLIElement>)
        }
      }}
      {...props}
    >
      {content}
    </li>
  )
}
