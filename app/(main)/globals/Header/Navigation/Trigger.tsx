"use client"
import {
  FC,
  useCallback
} from "react"
import { Menu, X } from "lucide-react"
import { NavigationTriggerProps } from "./types"
import { cn } from "@/lib/cn"
import { useContainer } from "../../Container/Context"

export const NavigationTrigger: FC<NavigationTriggerProps> = ({ className, onClick, ...props }) => {
  const { navIsOpen, setNavIsOpen } = useContainer()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setNavIsOpen(!navIsOpen)
      onClick?.(e)
    },
    [navIsOpen, setNavIsOpen, onClick]
  )

  return (
    <button
      {...props}
      type="button"
      onClick={handleClick}
      aria-expanded={navIsOpen}
      aria-controls="navigation-content"
      aria-label={navIsOpen ? "Close menu" : "Open menu"}
      className={cn(
        "p-2 rounded-md text-foreground hover:text-primary hover:bg-foreground/5 transition-colors",
        className
      )}
    >
      {navIsOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  )
}