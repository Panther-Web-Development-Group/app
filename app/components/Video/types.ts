import React, { 
  PropsWithChildren, 
  RefObject, 
  VideoHTMLAttributes,
  SyntheticEvent,
  Dispatch,
  SetStateAction,
} from "react"
import { ClassValue } from "clsx"

export type VideoState = 
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error"

export type VideoEvent = Omit<SyntheticEvent<HTMLVideoElement>, "target"> & { target: HTMLVideoElement }

export interface VideoContextProps {
  containerRef: RefObject<HTMLElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  focused: boolean
  setFocused: Dispatch<SetStateAction<boolean>>
  state: VideoState
  setState: Dispatch<SetStateAction<VideoState>>
  volume: number
  setVolume: Dispatch<SetStateAction<number>>
  muted: boolean
  setMuted: Dispatch<SetStateAction<boolean>>
  canPlay: boolean
  setCanPlay: Dispatch<SetStateAction<boolean>>
  canPlayThrough: boolean
  setCanPlayThrough: Dispatch<SetStateAction<boolean>>
  playbackRate: number
  setPlaybackRate: Dispatch<SetStateAction<number>>
  currentTime: number
  setCurrentTime: Dispatch<SetStateAction<number>>
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
  buffered: number
  setBuffered: Dispatch<SetStateAction<number>>
  isFullscreen: boolean
  setIsFullscreen: Dispatch<SetStateAction<boolean>>
  isPictureInPicture: boolean
  setIsPictureInPicture: Dispatch<SetStateAction<boolean>>
  handleSeek: ((e?: VideoEvent) => void) | (() => void)
  handlePlay: ((e?: VideoEvent) => void) | (() => void)
  handlePause: ((e?: VideoEvent) => void) | (() => void)
  handleEnded: ((e?: VideoEvent) => void) | (() => void)
  handleError: ((e?: VideoEvent) => void) | (() => void)
  handleFocus: ((e?: VideoEvent) => void) | (() => void)
  handleBlur: ((e?: VideoEvent) => void) | (() => void)
  handleKeyDown: ((e: React.KeyboardEvent) => void) | (() => void)
  handleCanPlay: ((e?: VideoEvent) => void) | (() => void)
  handleCanPlayThrough: ((e?: VideoEvent) => void) | (() => void)
  handleTimeUpdate: ((e?: VideoEvent) => void) | (() => void)
  handleVolumeChange: ((e?: VideoEvent) => void) | (() => void)
  handleLoadedMetadata: ((e?: VideoEvent) => void) | (() => void)
  toggleVideoState: () => void
  toggleFullscreen: () => Promise<void> | void
  togglePictureInPicture: () => Promise<void> | void
}

export type VideoProviderProps = PropsWithChildren

export type VideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  controlsClassName?: ClassValue
  useNativeControls?: boolean
}

export type VideoContainerProps = VideoHTMLAttributes<HTMLVideoElement> & {
  controlsClassName?: ClassValue
  useNativeControls?: boolean
  showStateIndicator?: boolean
  stateIndicatorPosition?: StateIndicatorPosition
  stateIndicatorShowIcon?: boolean
  stateIndicatorShowLabel?: boolean
}

export interface ControlsProps {
  className?: ClassValue
  playIcon?: React.ReactNode
  pauseIcon?: React.ReactNode
  showProgress?: boolean
  showVolume?: boolean
  showFullscreen?: boolean
  showPictureInPicture?: boolean
}

export interface ProgressProps {
  className?: ClassValue
  showTime?: boolean
  showBuffered?: boolean
}

export interface VolumeProps {
  className?: ClassValue
  showSlider?: boolean
}

export type StateIndicatorPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"
  | "center"

export interface StateIndicatorProps {
  className?: ClassValue
  showIcon?: boolean
  showLabel?: boolean
  position?: StateIndicatorPosition
}