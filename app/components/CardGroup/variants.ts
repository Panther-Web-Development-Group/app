import { tv } from "tailwind-variants"

export const cardGroupVariants = tv({
  base: "w-full",
  variants: {
    variant: {
      normal: "flex flex-col gap-6",
      grid: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
    },
  },
  defaultVariants: {
    variant: "normal",
  },
})
