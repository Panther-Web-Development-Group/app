import { tv } from "tailwind-variants"

export const tickerVariants = tv({
  base: [
    "relative w-full overflow-hidden",
    "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-12 before:bg-gradient-to-r before:from-background before:to-transparent",
    "after:pointer-events-none after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-12 after:bg-gradient-to-l after:from-background after:to-transparent",
  ],
})

