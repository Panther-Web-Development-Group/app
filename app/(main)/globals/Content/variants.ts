import { tv } from "tailwind-variants"

export const contentVariants = tv({
  base: "w-full min-w-0 overflow-x-hidden",
  variants: {
    variant: {
      regular: "flex w-full max-w-full flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8",
      grid: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3",
      withSidebar: "grid grid-cols-1 gap-8 lg:grid-cols-[1fr_24rem] lg:items-start",
    },
  },
  defaultVariants: {
    variant: "regular",
  },
})
