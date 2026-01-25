import { type FC } from "react"
import type { FooterProps, FooterSectionProps, FooterLinkProps, SocialLinkProps } from "./types"
import { cn } from "@/lib/cn"
import Link from "next/link"

export const Footer: FC<FooterProps> = ({
  sections,
  socialLinks,
  copyright,
  children,
  className,
  ...props
}) => {
  return (
    <footer
      className={cn(
        "border-t border-(--pw-border) bg-secondary text-secondary-foreground",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Custom Children Content */}
        {children && <div className="mb-8">{children}</div>}

        {/* Footer Sections */}
        {sections && (
          <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {sections}
          </div>
        )}

        {/* Social Links */}
        {socialLinks && (
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {socialLinks}
          </div>
        )}

        {/* Copyright */}
        {copyright && (
          <div className="border-t border-(--pw-border) pt-8 text-center text-sm text-secondary-foreground/80">
            {copyright}
          </div>
        )}
      </div>
    </footer>
  )
}

export const FooterSection: FC<FooterSectionProps> = ({
  title,
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <h3 className="text-sm font-semibold text-secondary-foreground">
        {title}
      </h3>
      <nav className="flex flex-col gap-2">
        {children}
      </nav>
    </div>
  )
}

export const FooterLink: FC<FooterLinkProps> = ({
  label,
  href,
  isExternal = false,
  target = "_self",
  icon,
  className,
  ...props
}) => {
  const linkProps = {
    href,
    target: isExternal ? "_blank" : target,
    rel: isExternal ? "noopener noreferrer" : undefined,
    className: cn(
      "text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground",
      className
    ),
    ...props,
  }

  const content = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </>
  )

  if (isExternal || href.startsWith("http")) {
    return <a {...linkProps}>{content}</a>
  }

  return <Link {...linkProps}>{content}</Link>
}

export const SocialLink: FC<SocialLinkProps> = ({
  platform,
  href,
  icon,
  image,
  "aria-label": ariaLabel,
  className,
  ...props
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel || `Visit our ${platform} page`}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-(--pw-border) text-secondary-foreground/80 transition-colors hover:border-(--pw-border) hover:text-secondary-foreground hover:bg-accent/15",
        className
      )}
      {...props}
    >
      {image ? (
        <img src={image} alt={platform} className="h-5 w-5" />
      ) : icon ? (
        icon
      ) : (
        <span className="text-sm font-medium">{platform.charAt(0).toUpperCase()}</span>
      )}
    </a>
  )
}
