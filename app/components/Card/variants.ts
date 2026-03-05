import { tv } from "tailwind-variants"

export const cardVariants = tv({
  base: "rounded-lg border border-foreground/10 bg-foreground/5 overflow-hidden",
  variants: {
    variant: {
      default: "p-6",
      compact: "p-4",
      full: "p-0",
      elevated: "p-6 shadow-lg border-foreground/20",
      wide: "p-8",
    },
    size: {
      small: "max-w-sm",
      medium: "max-w-md",
      large: "max-w-lg",
      xlarge: "max-w-xl",
      xxlarge: "max-w-2xl",
    },
    direction: {
      vertical: "flex flex-col",
      horizontal: "flex flex-col md:flex-row",
    },
  },
  defaultVariants: {
    variant: "default",
    direction: "vertical",
  },
})

export const cardSlotVariants = tv({
  slots: {
    title: "text-lg font-semibold text-foreground",
    content: "text-sm text-foreground/80",
    image: "relative overflow-hidden bg-foreground/5",
    list: "flex flex-col gap-2",
    listItem: "flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-foreground/5 transition-colors",
    listItemLink: "block",
    header: "flex flex-col gap-1",
    footer: "flex items-center gap-2 pt-4 mt-4 border-t border-foreground/10",
    badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-accent/20 text-accent",
    tag: "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-foreground/10 text-foreground/80",
    cta: "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity",
  },
})
