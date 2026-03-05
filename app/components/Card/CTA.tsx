"use client"

import { FC } from "react"
import Link from "next/link"
import type { CardLinkProps, CardButtonProps } from "./types"
import { cardSlotVariants } from "./variants"
import { cn } from "@/lib/cn"

export const CardCTA: FC<CardLinkProps | CardButtonProps> = (props) => {
  const { cta } = cardSlotVariants()

  if ("href" in props) {
    const { href, children, className, target, rel, ...rest } = props
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={cn(cta(), className)}
        {...rest}
      >
        {children}
      </Link>
    )
  }

  const { onClick, children, className, ...rest } = props
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(cta(), className)}
      {...rest}
    >
      {children}
    </button>
  )
}
