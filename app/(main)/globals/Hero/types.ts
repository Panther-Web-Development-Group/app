import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
  ImgHTMLAttributes,
} from "react"

export type HeroType = 
  | "screen"
  | "full"

export type HeroProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
    /** Index of the initially active slide (0-based) */
    defaultIndex?: number
    /** Auto-advance slides in milliseconds. 0 = disabled */
    autoPlay?: number
    /** The type of hero used */
    type?: HeroType
  }

export type HeroSlideProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type HeroSlideImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "placeholder"
> & {
  /** Alt text is required for accessibility */
  alt: string
  /** Optional placeholder for loading state */
  placeholder?: "blur" | "empty"
}

export type HeroSlideContentProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type HeroControlsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export type HeroIndicatorsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export type HeroContextType = {
  currentIndex: number
  totalSlides: number
  goToSlide: (index: number) => void
  goNext: () => void
  goPrev: () => void
  isPaused: boolean
  pause: () => void
  resume: () => void
}
