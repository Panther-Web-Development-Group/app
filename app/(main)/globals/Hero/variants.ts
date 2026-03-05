import { tv } from "tailwind-variants"

export const heroVariants = tv({
  slots: {
    root: "relative flex w-full min-w-0 flex-col overflow-hidden",
    container: "relative flex-1 min-h-0 w-full",
    track: "flex h-full min-h-0 transition-transform duration-500 ease-out",
    slideWrapper: "flex h-full min-h-0 min-w-0 flex-shrink-0 overflow-hidden",
    slide: "relative h-full min-h-[60vh] w-full overflow-hidden",
    bar: "absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 px-4 pb-6 pt-12",
  },
  variants: {
    type: {
      screen: {
        root: "h-dvh max-h-dvh min-h-0",
        slide: "h-full min-h-0",
      },
      full: {
        root: "min-h-[60vh]",
      },
    },
  },
  defaultVariants: {
    type: "full",
  },
})
