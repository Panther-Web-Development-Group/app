"use client"

import { type FC } from "react"
import { ButtonProps } from "./types"
import { buttonVariants } from "./config"
import { cn } from "@/lib/cn"
import { Link } from "../Link"
import { Tooltip } from "../Tooltip"
import { ButtonOnlyProps, ButtonLinkProps } from "./types"

export const Button: FC<ButtonProps> = (props) => {
  const {
    as = "button",
    children,
    className,
    disabled,
    variant,
    size,
    loading,
    loadingContent,
    loadingClassName,
    icon,
    iconClassName,
    tooltip,
    tooltipSide = "top",
    ...restProps
  } = props

  const buttonChildren = loading ? loadingContent : children
  const buttonClassName = cn(
    buttonVariants({ variant, size, loading, disabled }),
    loading && loadingClassName,
    className
  )

  const button =
    as === "link" ? (
      <Link {...(restProps as ButtonLinkProps)} className={buttonClassName}>
        {icon ? <span className={cn(iconClassName)}>{icon}</span> : null}
        {buttonChildren}
      </Link>
    ) : (
      <button {...(restProps as ButtonOnlyProps)} className={buttonClassName}>
        {icon ? <span className={cn(iconClassName)}>{icon}</span> : null}
        {buttonChildren}
      </button>
    )

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side={tooltipSide}>
        {button}
      </Tooltip>
    )
  }

  return button
}

Object.assign(Button, {
  variants: buttonVariants,
  Destructive: ({ children, ...props }: Omit<ButtonOnlyProps, "variant">) => (
    <Button {...props} variant="destructive">
      {children}
    </Button>
  ),
  Outline: ({ children, ...props }: Omit<ButtonOnlyProps, "variant">) => (
    <Button {...props} variant="outline">
      {children}
    </Button>
  ),
  Ghost: ({ children, ...props }: Omit<ButtonOnlyProps, "variant">) => (
    <Button {...props} variant="ghost">
      {children}
    </Button>
  ),
  Link: ({ children, ...props }: Omit<ButtonOnlyProps, "variant">) => (
    <Button {...props} variant="link">
      {children}
    </Button>
  ),
  Icon: ({ children, ...props }: Omit<ButtonOnlyProps, "variant">) => (
    <Button {...props} variant="icon">
      {children}
    </Button>
  ),
  Default: ({ children, ...props }: Omit<ButtonOnlyProps, "variant">) => (
    <Button {...props} variant="default">
      {children}
    </Button>
  )
})
