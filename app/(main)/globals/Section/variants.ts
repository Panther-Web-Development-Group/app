import { tv } from "tailwind-variants"

export const sectionVariants = tv({
  slots: {
    root: "flex w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8",
    title: "text-center font-bold uppercase tracking-wide px-4 py-6",
    content: "max-w-7xl px-6 md:px-8",
  },
  variants: {
    type: {
      full: {},
      screen: {
        root: "min-h-screen",
      },
      medium: {
        content: "max-w-3xl",
      },
      narrow: {
        content: "max-w-2xl",
      },
    },
    as: {
      h1: {
        title: "text-3xl md:text-4xl",
      },
      h2: {
        title: "text-2xl md:text-3xl",
      },
      h3: {
        title: "text-xl md:text-2xl",
      },
      h4: {
        title: "text-lg md:text-xl",
      },
      h5: {
        title: "text-base md:text-lg",
      },
      h6: {
        title: "text-sm md:text-base",
      },
    },
  },
  defaultVariants: {
    type: "full",
    as: "h2",
  },
})
