"use client"
import { FC, useCallback, useEffect, useRef } from "react"
import { AudioContainerProps } from "./types"
import { cn } from "@/lib/cn"
import { useAudioContext } from "./Context"
import { Controls } from "./Controls"

export const AudioContainer: FC<AudioContainerProps> = ({
  controlsClassName,
  className,
  useNativeControls,
  ...props
}) => {
  const { 
    audioRef, 
    state,
    handleFocus, 
    handleBlur,
    handlePause,
    handlePlay,
    handleKeyDown,
    focused
  } = useAudioContext()

  const containerRef = useRef<HTMLElement>(null)

  const toggleAudioState = useCallback(() => {
    if (!audioRef.current) return
    if (state === "playing") {
      audioRef.current.pause()
      handlePause()
    } else {
      audioRef.current.play()
      handlePlay()
    }
  }, [audioRef, state, handlePause, handlePlay])

  // Handle keyboard events on the container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleContainerKeyDown = (e: KeyboardEvent) => {
      // Create a React KeyboardEvent-like object
      const reactEvent = {
        ...e,
        key: e.key,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      } as unknown as React.KeyboardEvent

      handleKeyDown(reactEvent)
    }

    container.addEventListener("keydown", handleContainerKeyDown)

    return () => {
      container.removeEventListener("keydown", handleContainerKeyDown)
    }
  }, [handleKeyDown])

  // Set focus state when container is focused
  const handleContainerFocus = useCallback(() => {
    handleFocus()
  }, [handleFocus])

  const handleContainerBlur = useCallback(() => {
    handleBlur()
  }, [handleBlur])

  const handleContainerClick = useCallback(() => {
    // Focus the container when clicked to enable keyboard controls
    containerRef.current?.focus()
  }, [])

  return (
    <figure 
      ref={containerRef}
      className={cn("relative w-full min-h-[120px] group", className)}
      tabIndex={0}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
      onClick={handleContainerClick}
    >
      <audio 
        {...props}
        ref={audioRef} 
        className={cn("relative inset-0 w-full", controlsClassName)} 
        controls={useNativeControls}
        />
      {!useNativeControls && (
        <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-center w-full", controlsClassName)}>
          <div className="w-full max-w-full">
            <Controls showProgress={true} showVolume={true} />
          </div>
        </div>
      )}
    </figure>
  )
}
