"use client"
import { FC } from "react"
import { AudioContainer } from "./Container"
import { AudioProvider } from "./Context"
import { AudioProps } from "./types"

export const Audio: FC<AudioProps> = ({ ...props}) => {
  return (
    <AudioProvider>
      <AudioContainer {...props} />
    </AudioProvider>
  )
}
