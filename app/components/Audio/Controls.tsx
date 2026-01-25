"use client"
import { FC, useCallback } from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/cn"
import { Button } from "../Button"
import { useAudioContext } from "./Context"
import { Progress } from "./Progress"
import { Volume } from "./Volume"
import { ControlsProps } from "./types"

export const Controls: FC<ControlsProps> = ({ 
  className,
  playIcon,
  pauseIcon,
  showProgress = false,
  showVolume = false
}) => {
  const { audioRef, state, handlePlay, handlePause } = useAudioContext()

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (state === "playing") {
      audioRef.current.pause()
      handlePause()
    } else {
      audioRef.current.play()
      handlePlay()
    }
  }, [audioRef, state, handlePlay, handlePause])

  const isPlaying = state === "playing"

  return (
    <div className={cn(
      "flex flex-col gap-3 w-full bg-linear-to-t from-black/80 via-black/60 to-transparent p-4 rounded-t-lg", 
      "opacity-100 visible",
      className
    )}>
      {showProgress && <Progress />}
      <div className="flex items-center justify-between w-full">
        <Button
          variant="icon"
          onClick={handleTogglePlay}
          className="p-2 rounded-full bg-black/0 hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            pauseIcon || <Pause className="w-4 h-4 text-white fill-white" />
          ) : (
            playIcon || <Play className="w-4 h-4 text-white fill-white" />
          )}
        </Button>
        {showVolume && <Volume />}
      </div>
    </div>
  )
}
