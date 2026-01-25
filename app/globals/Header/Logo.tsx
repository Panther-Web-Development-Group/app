import { type FC } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/cn"
import type { HeaderLogoProps } from "./types"

export const HeaderLogo: FC<HeaderLogoProps> = ({ 
  src,
  alt = "Logo",
  href = "/",
  className,
  ...props 
}) => {
  return (
    <Link 
      href={href}
      className={cn("flex items-center", className)}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={120}
          height={40}
          className="h-auto w-auto"
          priority
        />
      ) : (
        <span className="text-base font-semibold tracking-tight text-foreground">
          PantherWeb
        </span>
      )}
    </Link>
  )
}
