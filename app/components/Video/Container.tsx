"use client"
import { FC, useCallback, useState, useEffect, useRef } from "react"
import { VideoContainerProps } from "./types"
import { cn } from "@/lib/cn"
import { useVideoContext } from "./Context"
import { Controls } from "./Controls"
import { StateIndicator } from "./StateIndicator"
import { setImmediate } from "@/lib/setImmediate"

export const VideoContainer: FC<VideoContainerProps> = ({
  controlsClassName,
  className,
  useNativeControls,
  showStateIndicator = true,
  stateIndicatorPosition = "top-right",
  stateIndicatorShowIcon = true,
  stateIndicatorShowLabel = true,
  ...props
}) => {
  const { 
    videoRef,
    containerRef,
    state,
    handleFocus, 
    handleBlur,
    handlePause,
    handlePlay,
    isFullscreen,
    isPictureInPicture
  } = useVideoContext()

  const [showControls, setShowControls] = useState(() => !isFullscreen)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wasFullscreenRef = useRef(isFullscreen)

  const toggleVideoState = useCallback(() => {
    if (!videoRef.current) return
    if (state === "playing") {
      videoRef.current.pause()
      handlePause()
    } else {
      videoRef.current.play()
      handlePlay()
    }
  }, [videoRef, state, handlePause, handlePlay])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isPictureInPicture) return // Don't show controls in PIP mode
    if (!isFullscreen || !containerRef.current) {
      setShowControls(true)
      return
    }

    // Show controls when hovering near the bottom (within 150px)
    const rect = containerRef.current.getBoundingClientRect()
    const distanceFromBottom = rect.bottom - e.clientY
    
    if (distanceFromBottom <= 150) {
      setShowControls(true)
      
      // Clear existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      
      // Hide controls after 3 seconds of inactivity
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isFullscreen, isPictureInPicture, containerRef])

  const handleMouseLeave = useCallback(() => {
    if (isFullscreen) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isFullscreen])

  // Manage controls visibility based on fullscreen and PIP state changes
  useEffect(() => {
    const wasFullscreen = wasFullscreenRef.current
    wasFullscreenRef.current = isFullscreen

    // If in PIP mode, hide custom controls (native controls will be used)
    if (isPictureInPicture) {
      setImmediate(() => setShowControls(false))
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = null
      }
      return
    }

    if (!isFullscreen) {
      // Use a callback to avoid triggering a cascade of renders
      setImmediate(() => setShowControls(true))
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = null
      }
      return
    }

    // Entering fullscreen: show controls, then auto-hide
    if (!wasFullscreen && isFullscreen) {
      // Use a callback to avoid triggering a cascade of renders
      setImmediate(() => setShowControls(true))
      const timeoutId = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      controlsTimeoutRef.current = timeoutId
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isFullscreen, isPictureInPicture])

  return (
    <figure 
      ref={containerRef} 
      className={cn("relative w-full aspect-video group", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video 
        {...props}
        ref={videoRef} 
        className={cn("relative inset-0 w-full h-full object-cover", controlsClassName)} 
        playsInline
        controls={useNativeControls}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={toggleVideoState}
        />
      {!useNativeControls && (
        <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-center", controlsClassName)}>
          <div className={cn("w-full max-w-full transition-opacity duration-300", {
            "opacity-0 invisible": isFullscreen && !showControls,
            "opacity-100 visible": !isFullscreen || showControls
          })}>
            <Controls showProgress={true} showVolume={true} showPictureInPicture={true} showFullscreen={true} />
          </div>
        </div>
      )}
      {showStateIndicator && (
        <StateIndicator
          position={stateIndicatorPosition}
          showIcon={stateIndicatorShowIcon}
          showLabel={stateIndicatorShowLabel}
        />
      )}
    </figure>
  )
}