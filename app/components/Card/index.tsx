import { FC } from "react"
import type { CardProps } from "./types"
import { cardVariants } from "./variants"
import { cn } from "@/lib/cn"
import { CardTitle } from "./Title"
import { CardContent } from "./Content"
import { CardImage } from "./Image"
import { CardList, CardListItem } from "./List"
import { CardCTA } from "./CTA"

const CardRoot: FC<CardProps> = ({
  children,
  className,
  variant = "default",
  size,
  direction = "vertical",
  ...props
}) => {
  return (
    <div
      className={cn(cardVariants({ variant, size, direction }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const Card = Object.assign(CardRoot, {
  Title: CardTitle,
  Content: CardContent,
  Image: CardImage,
  List: Object.assign(CardList, { Item: CardListItem }),
  CTA: CardCTA,
})
