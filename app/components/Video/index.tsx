"use client"
import { FC } from "react"
import { VideoContainer } from "./Container"
import { VideoProvider } from "./Context"
import { VideoProps } from "./types"

export const Video: FC<VideoProps> = ({ ...props}) => {
  return (
    <VideoProvider>
      <VideoContainer {...props} />
    </VideoProvider>
  )
}