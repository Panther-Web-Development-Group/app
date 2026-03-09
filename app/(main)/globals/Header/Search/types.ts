import { 
  FC,
  PropsWithChildren,
  HTMLAttributes,
  DetailedHTMLProps,
  InputHTMLAttributes,
  ButtonHTMLAttributes
} from "react"

export type SearchProps = DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>, 
  HTMLFormElement
> & {
  /** When true, applies styles for visibility over hero (transparent header) */
  overHero?: boolean
}

export type SearchInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  placeholder?: string
}

export type SearchAutocompleteProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> 

export type SearchAutocompleteItemProps = DetailedHTMLProps<
  HTMLAttributes<HTMLLIElement>,
  HTMLLIElement
> & {
  href?: string
  image?: string
  imageAlt?: string
  title?: React.ReactNode
  description?: React.ReactNode
  onClick?: React.MouseEventHandler
}

export type SearchAutocompleteSectionProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  title?: React.ReactNode
}

export type SearchAutocompleteListProps = DetailedHTMLProps<
  HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
>

export type SearchSubmitProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>