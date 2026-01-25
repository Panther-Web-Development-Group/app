"use client"
import { FC, useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/cn"
import { useAudioContext } from "./Context"
import { ProgressProps } from "./types"
import { formatTime } from "@/lib/format/formatTime"

export const Progress: FC<ProgressProps> = ({ 
  className,
  showTime = true,
  showBuffered = true 
}) => {
  const { 
    audioRef, 
    currentTime, 
    duration, 
    buffered,
    setCurrentTime 
  } = useAudioContext()
  
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  const handleSeek = useCallback((clientX: number) => {
    if (!progressRef.current || !audioRef.current || duration === 0) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newTime = percent * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [audioRef, duration, setCurrentTime])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    handleSeek(e.clientX)
  }, [handleSeek])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const hoverTimeValue = percent * duration
    setHoverTime(hoverTimeValue)

    if (isDragging) handleSeek(e.clientX)
  }, [isDragging, handleSeek, duration])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setHoverTime(null)
    // Don't stop dragging on leave - let global handlers manage it
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      handleSeek(e.clientX)
    }
  }, [isDragging, handleSeek])

  // Global pointer event handlers for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!progressRef.current || duration === 0) return
      
      const rect = progressRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const hoverTimeValue = percent * duration
      setHoverTime(hoverTimeValue)
      handleSeek(e.clientX)
    }

    const handleGlobalPointerUp = () => {
      setIsDragging(false)
      setHoverTime(null)
    }

    const controller = new AbortController()
    const { signal } = controller

    document.addEventListener("pointermove", handleGlobalPointerMove, { signal })
    document.addEventListener("pointerup", handleGlobalPointerUp, { signal })

    return () => controller.abort()
  }, [isDragging, duration, handleSeek])

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      {/* Current time */}
      {showTime && (
        <span className="text-xs text-white/90 rounded-full px-2 py-0.5 bg-white/20 backdrop-blur-sm whitespace-nowrap min-w-12 text-center inline-block">
          {formatTime(currentTime)}
        </span>
      )}
      
      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative h-2 flex-1 bg-white/20 rounded-full cursor-pointer group"
      >
        {/* Buffered progress */}
        {showBuffered && (
          <div
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all"
            style={{ width: `${bufferedPercent}%` }}
          />
        )}
        
        {/* Current progress */}
        <div
          className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        
        {/* Hover indicator */}
        {hoverTime !== null && (
          <div
            className="absolute top-1/2 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ 
              left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%`,
              transform: "translate(-50%, -50%)"
            }}
          />
        )}
        
        {/* Current time indicator */}
        <div
          className="absolute top-1/2 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `${progressPercent}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
      
      {/* Duration */}
      {showTime && (
        <span className="text-xs text-white/90 rounded-full px-2 py-0.5 bg-white/20 backdrop-blur-sm whitespace-nowrap min-w-12 text-center inline-block">
          {formatTime(duration)}
        </span>
      )}
    </div>
  )
}
