type NavBackdropProps = {
  open: boolean
  onClose: () => void
}

export const NavBackdrop = ({ open, onClose }: NavBackdropProps) => (
  <div
    id="nav-backdrop"
    className={`nav-backdrop${open ? " open" : ""}`}
    aria-hidden
    onClick={onClose}
  />
)
