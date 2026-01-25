"use client"
import { FC, useCallback, useRef, useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/cn"
import { Button } from "@/app/components/Button"
import { useVideoContext } from "./Context"
import { VolumeProps } from "./types"

export const Volume: FC<VolumeProps> = ({ 
  className,
  showSlider = true 
}) => {
  const { videoRef, volume, setVolume, muted, setMuted, focused } = useVideoContext()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverVolume, setHoverVolume] = useState<number | null>(null)

  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return
    const newMuted = !muted
    videoRef.current.muted = newMuted
    setMuted(newMuted)
  }, [videoRef, muted, setMuted])

  const handleVolumeChange = useCallback((clientX: number) => {
    if (!sliderRef.current || !videoRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = (clientX - rect.left) / rect.width
    const newVolume = Math.max(0, Math.min(1, percent))
    if (newVolume > 0 && muted) {
      videoRef.current.muted = false
      setMuted(false)
    }

    videoRef.current.volume = newVolume
    setVolume(newVolume)
  }, [sliderRef, videoRef, setVolume, setMuted, muted])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleVolumeChange(e.clientX)
  }, [handleVolumeChange])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current || !videoRef.current || !focused) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const hoverVolume = Math.max(0, Math.min(1, percent))
    setHoverVolume(hoverVolume)
    
    if (isDragging) setVolume(hoverVolume)
  }, [sliderRef, videoRef, focused, isDragging, setVolume])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setHoverVolume(null)
    if (isDragging) setIsDragging(false)
  }, [isDragging])

  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) handleVolumeChange(e.clientX)
  }, [isDragging, handleVolumeChange])

  // Global pointer event handlers for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!sliderRef.current || !videoRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const hoverVolume = Math.max(0, Math.min(1, percent))
      setHoverVolume(hoverVolume)
      handleVolumeChange(e.clientX)
    }

    const handleGlobalPointerUp = () => {
      setIsDragging(false)
      setHoverVolume(null)
    }

    document.addEventListener("pointermove", handleGlobalPointerMove)
    document.addEventListener("pointerup", handleGlobalPointerUp)

    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove)
      document.removeEventListener("pointerup", handleGlobalPointerUp)
    }
  }, [isDragging, handleVolumeChange, sliderRef, videoRef])

  return (
    <div 
      className={cn("flex items-center gap-2", className)}>
      <Button
        variant="icon"
        onClick={handleMuteToggle}
        aria-label={muted ? "Unmute" : "Mute"}>
        {muted || volume === 0 ? (
          <VolumeX className="w-5 h-5 text-white" /> 
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )} 
      </Button>
      
      {showSlider && (
        <div
          ref={sliderRef}
          onClick={handleSliderClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="relative w-24 h-1 bg-white/20 rounded-full cursor-pointer group"
        >
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
            style={{ width: `${(muted ? 0 : volume) * 100}%` }}
          />
          <div
            className="absolute top-1/2 left-0 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(muted ? 0 : volume) * 100}%`, transform: "translate(-50%, -50%)" }}
          />
          {hoverVolume !== null && (
            <div
              className="absolute top-1/2 left-0 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ 
                left: `${hoverVolume * 100}%`, 
                transform: "translate(-50%, -50%)",
                opacity: hoverVolume > 0 ? 1 : 0
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
