/** Affiliate / partner logos; replace imageSrc with real assets when available. */
export type AffiliateItem = {
  readonly href: string
  readonly label: string
  readonly imageSrc: string
}

export const AFFILIATE_ITEMS: readonly AffiliateItem[] = [
  { href: "/", label: "ProGSU", imageSrc: "/file.svg" },
  { href: "/", label: "Girls Who Code", imageSrc: "/file.svg" },
  { href: "/", label: "Girls++", imageSrc: "/file.svg" },
  { href: "/", label: "Robotics Club", imageSrc: "/file.svg" },
  { href: "/", label: "Partner", imageSrc: "/file.svg" },
  { href: "/", label: "Partner", imageSrc: "/file.svg" },
  { href: "/", label: "Partner", imageSrc: "/file.svg" },
  { href: "/", label: "Partner", imageSrc: "/file.svg" },
] as const
