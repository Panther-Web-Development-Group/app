"use client"
import { FC, useCallback } from "react"
import { Play, Pause, Maximize, Minimize, PictureInPicture } from "lucide-react"
import { cn } from "@/lib/cn"
import { Button } from "../Button"
import { useVideoContext } from "./Context"
import { Progress } from "./Progress"
import { Volume } from "./Volume"
import { ControlsProps } from "./types"

export const Controls: FC<ControlsProps> = ({ 
  className,
  playIcon,
  pauseIcon,
  showProgress = false,
  showVolume = false,
  showPictureInPicture = false,
  showFullscreen = false
}) => {
  const { 
    videoRef, 
    state, 
    handlePlay, 
    handlePause, 
    isFullscreen, 
    toggleFullscreen,
    isPictureInPicture,
    togglePictureInPicture
  } = useVideoContext()

  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return

    if (state === "playing") {
      videoRef.current.pause()
      handlePause()
    } else {
      videoRef.current.play()
      handlePlay()
    }
  }, [videoRef, state, handlePlay, handlePause])

  const isPlaying = state === "playing"

  return (
    <div className={cn(
      "flex flex-col gap-3 w-full bg-linear-to-t from-black/80 via-black/60 to-transparent p-2 rounded-t-lg",
      className
    )}>
      {showProgress && <Progress />}
      <div className="flex items-center justify-between w-full">
        <Button
          variant="icon"
          onClick={handleTogglePlay}
          className="p-3 rounded-full bg-black/0 hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            pauseIcon || <Pause className="w-6 h-6 text-white fill-white" />
          ) : (
            playIcon || <Play className="w-6 h-6 text-white fill-white" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          {showVolume && <Volume />}
          {showPictureInPicture && (
            <Button
              variant="icon"
              onClick={togglePictureInPicture}
              className={cn(
                "p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50",
                isPictureInPicture
                  ? "bg-white/20 hover:bg-white/30"
                  : "bg-black/0 hover:bg-black/10"
              )}
              aria-label={isPictureInPicture ? "Exit picture in picture" : "Enter picture in picture"}
            >
              <PictureInPicture 
                className={cn(
                  "w-6 h-6 text-white",
                  isPictureInPicture ? "fill-white" : "fill-none"
                )} 
              />
            </Button>
          )}
          {showFullscreen && (
            <Button
              variant="icon"
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-black/0 hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6 text-white fill-white" />
              ) : (
                <Maximize className="w-6 h-6 text-white fill-white" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
