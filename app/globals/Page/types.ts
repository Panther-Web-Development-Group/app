import { HTMLAttributes, PropsWithChildren } from "react"

export interface PageContextProps {
  navIsOpen: boolean // default: false
  setNavIsOpen: (isOpen: boolean) => void
}

export type PageProviderProps = PropsWithChildren

export type PageProps = HTMLAttributes<HTMLDivElement>