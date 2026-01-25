import React, { 
  PropsWithChildren, 
  RefObject, 
  AudioHTMLAttributes,
  SyntheticEvent,
  Dispatch,
  SetStateAction,
} from "react"
import { ClassValue } from "clsx"

export type AudioState = 
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error"

export type AudioEvent = Omit<SyntheticEvent<HTMLAudioElement>, "target"> & { target: HTMLAudioElement }

export interface AudioContextProps {
  audioRef: RefObject<HTMLAudioElement | null>
  focused: boolean
  setFocused: Dispatch<SetStateAction<boolean>>
  state: AudioState
  setState: Dispatch<SetStateAction<AudioState>>
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
  handleSeek: ((e?: AudioEvent) => void) | (() => void)
  handlePlay: ((e?: AudioEvent) => void) | (() => void)
  handlePause: ((e?: AudioEvent) => void) | (() => void)
  handleEnded: ((e?: AudioEvent) => void) | (() => void)
  handleError: ((e?: AudioEvent) => void) | (() => void)
  handleFocus: ((e?: AudioEvent) => void) | (() => void)
  handleBlur: ((e?: AudioEvent) => void) | (() => void)
  handleKeyDown: ((e: React.KeyboardEvent) => void) | (() => void)
  handleCanPlay: ((e?: AudioEvent) => void) | (() => void)
  handleCanPlayThrough: ((e?: AudioEvent) => void) | (() => void)
  handleTimeUpdate: ((e?: AudioEvent) => void) | (() => void)
  handleVolumeChange: ((e?: AudioEvent) => void) | (() => void)
  handleLoadedMetadata: ((e?: AudioEvent) => void) | (() => void)
  toggleAudioState: () => void
}

export type AudioProviderProps = PropsWithChildren

export type AudioProps = AudioHTMLAttributes<HTMLAudioElement> & {
  controlsClassName?: ClassValue
  useNativeControls?: boolean
}

export type AudioContainerProps = AudioHTMLAttributes<HTMLAudioElement> & {
  controlsClassName?: ClassValue
  useNativeControls?: boolean
}

export interface ControlsProps {
  className?: ClassValue
  playIcon?: React.ReactNode
  pauseIcon?: React.ReactNode
  showProgress?: boolean
  showVolume?: boolean
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
