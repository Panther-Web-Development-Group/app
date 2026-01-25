import { type FC } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/cn"
import type { SidebarLogoProps } from "../types"

export const SidebarLogo: FC<SidebarLogoProps> = ({ 
  src,
  alt = "Logo",
  href = "/",
  className,
  ...props 
}) => {
  return (
    <Link 
      href={href}
      className={cn(
        "flex aspect-square w-12 items-center justify-center rounded-lg border border-(--pw-border) bg-accent/20 transition-colors hover:bg-accent/30",
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
      ) : (
        <span className="text-sm font-semibold text-secondary-foreground">PW</span>
      )}
    </Link>
  )
}
