"use client"
import { FC, PropsWithChildren } from "react"
import { ContainerProps } from "./types"
import { ContainerProvider } from "./Context"
import { cn } from "@/lib/cn"

export const Container: FC<PropsWithChildren<ContainerProps>> = ({ className, children, ...props }) => {
  return (
    <ContainerProvider>
      <div {...props} className={cn("flex min-h-screen min-w-0 flex-col overflow-x-hidden", className)}>
        {children}
      </div>
    </ContainerProvider>
  )
}