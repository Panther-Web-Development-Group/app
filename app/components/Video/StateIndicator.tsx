"use client"
import { FC } from "react"
import { Loader2, Pause, Square, AlertCircle } from "lucide-react"
import { cn } from "@/lib/cn"
import { useVideoContext } from "./Context"
import { StateIndicatorProps } from "./types"

export const StateIndicator: FC<StateIndicatorProps> = ({
  className,
  showIcon = true,
  showLabel = true,
  position = "top-left"
}) => {
  const { state } = useVideoContext()

  const stateConfig = {
    loading: {
      icon: Loader2,
      label: "Loading",
      className: "text-blue-500"
    },
    paused: {
      icon: Pause,
      label: "Paused",
      className: "text-yellow-500"
    },
    ended: {
      icon: Square,
      label: "Ended",
      className: "text-gray-500"
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      className: "text-red-500"
    }
  }

  const config = stateConfig[state as keyof typeof stateConfig]
  const Icon = state === "playing" ? null : config.icon

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  }

  return (
    state === "playing" ? null : (
      <div
        className={cn(
          "absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm transition-opacity duration-200 z-10",
          positionClasses[position],
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={`Video state: ${config.label}`}
      >
        {showIcon && Icon !== null && (
          <Icon
            className={cn(
              "w-4 h-4",
              config.className,
              state === "loading" && "animate-spin"
            )}
          />
        )}
        {showLabel && Icon !== null && (
          <span className={cn("text-xs font-medium text-white")}>
            {config.label}
          </span>
          )}
        </div>
    )
  )
}
