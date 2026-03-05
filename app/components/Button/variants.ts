import { tv } from "tailwind-variants"

export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center font-medium transition-colors",
    "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-accent text-accent-foreground hover:opacity-90 active:opacity-80",
      secondary:
        "bg-foreground/10 text-foreground hover:bg-foreground/15 active:bg-foreground/20",
      outline:
        "border border-foreground/20 bg-transparent hover:bg-foreground/5 active:bg-foreground/10",
      ghost:
        "bg-transparent hover:bg-foreground/5 active:bg-foreground/10",
      destructive:
        "bg-red-500/20 text-red-400 hover:bg-red-500/30 active:bg-red-500/40",
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    },
    fullWidth: {
      true: "w-full",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
})
