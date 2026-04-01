import { Menu, X } from "lucide-react"

type HamburgerProps = {
  open: boolean
  onToggle: () => void
}

export const Hamburger = ({ open, onToggle }: HamburgerProps) => (
  <button
    type="button"
    id="hamburger"
    className="hamburger"
    aria-expanded={open}
    aria-controls="mobile-menu"
    aria-label={open ? "Close menu" : "Open menu"}
    onClick={onToggle}
  >
    {open ? (
      <X size={22} strokeWidth={2} aria-hidden />
    ) : (
      <Menu size={22} strokeWidth={2} aria-hidden />
    )}
  </button>
)
