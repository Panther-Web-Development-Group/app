import { cva } from "class-variance-authority"

export const defaultButtonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

export const defaultIconButtonClasses = "h-10 w-10 p-0"

export const buttonVariants = cva(defaultButtonClasses, {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-500 text-white hover:bg-gray-600",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-gray-300 bg-white hover:bg-gray-100",
      ghost: "hover:bg-gray-100",
      link: "text-blue-500 underline-offset-4 hover:underline",
      icon: defaultIconButtonClasses,
      default: "bg-gray-500 text-white hover:bg-gray-600",
    },
    size: {
      micro: "h-4 w-4",
      tiny: "h-6 w-6",
      mini: "h-8 w-8",
      "extra-small": "h-10 w-10",
      small: "h-12 w-12",
      medium: "h-14 w-14",
      large: "h-16 w-16",
      "extra-large": "h-18 w-18",
      huge: "h-20 w-20",
      massive: "h-24 w-24",
      default: "h-10 w-10",
      // Button size aliases
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
      xl: "h-12 w-12",
    },
    loading: {
      true: "opacity-50",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
})