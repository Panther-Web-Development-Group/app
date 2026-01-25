"use client"
import React, { 
  createContext, 
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  FC
} from "react"
import { 
  VideoContextProps, 
  VideoProviderProps,
  VideoState,
  VideoEvent,
} from "./types"

export const VideoContext = createContext<VideoContextProps | null>(null)

export const useVideoContext = () => {
  const context = useContext(VideoContext)
  if (!context) throw new Error("useVideoContext must be used within a VideoProvider")
  return context
}

export const VideoProvider: FC<VideoProviderProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLElement>(null)
  const [videoState, setVideoState] = useState<VideoState>("loading")
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [canPlay, setCanPlay] = useState(false)
  const [canPlayThrough, setCanPlayThrough] = useState(false)
  const [focused, setFocused] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)

  const handlePlay = useCallback((e?: VideoEvent) => {
    setVideoState("playing")
  }, [])

  const handlePause = useCallback((e?: VideoEvent) => {
    setVideoState("paused")
  }, [])

  const handleEnded = useCallback((e?: VideoEvent) => {
    setVideoState("ended")
  }, [])

  const handleError = useCallback((e?: VideoEvent) => {
    setVideoState("error")
  }, [])

  const handleFocus = useCallback((e?: VideoEvent) => {
    setFocused(true)
  }, [])

  const handleBlur = useCallback((e?: VideoEvent) => {
    setFocused(false)
  }, [])

  const toggleVideoState = useCallback(() => {
    if (!videoRef.current) return
    if (videoState === "playing") {
      videoRef.current.pause()
      handlePause()
    } else {
      videoRef.current.play()
      handlePlay()
    }
  }, [videoState, handlePlay, handlePause])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return
    
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await containerRef.current.requestFullscreen()
      } else {
        // Exit fullscreen
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error)
    }
  }, [containerRef])

  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return
    try {
      if (!document.pictureInPictureElement) {
        await videoRef.current.requestPictureInPicture()
      } else {
        await document.exitPictureInPicture()
      }
    } catch (error) {
      console.error("Error toggling picture in picture:", error)
    }
  }, [videoRef])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!videoRef.current || !focused) return

    switch (e.key) {
      case " ":
        e.preventDefault()
        toggleVideoState()
        break
      case "ArrowLeft":
        e.preventDefault()
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
          setCurrentTime(videoRef.current.currentTime)
        }
        break
      case "ArrowRight":
        e.preventDefault()
        if (videoRef.current) {
          const newTime = Math.min(duration, videoRef.current.currentTime + 5)
          videoRef.current.currentTime = newTime
          setCurrentTime(newTime)
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (videoRef.current) {
          const newVolume = Math.min(1, videoRef.current.volume + 0.1)
          videoRef.current.volume = newVolume
          setVolume(newVolume)
          if (muted && newVolume > 0) {
            videoRef.current.muted = false
            setMuted(false)
          }
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (videoRef.current) {
          const newVolume = Math.max(0, videoRef.current.volume - 0.1)
          videoRef.current.volume = newVolume
          setVolume(newVolume)
          if (newVolume === 0) {
            videoRef.current.muted = true
            setMuted(true)
          }
        }
        break
      case "m":
      case "M":
        e.preventDefault()
        if (videoRef.current) {
          const newMuted = !muted
          videoRef.current.muted = newMuted
          setMuted(newMuted)
        }
        break
      case "f":
      case "F":
        e.preventDefault()
        toggleFullscreen()
        break
    }
  }, [focused, duration, muted, toggleVideoState, toggleFullscreen, setCurrentTime, setVolume, setMuted])

  const handleCanPlay = useCallback((e?: VideoEvent) => {
    setCanPlay(true)
  }, [])

  const handleCanPlayThrough = useCallback((e?: VideoEvent) => {
    setCanPlayThrough(true)
  }, [])

  const handleTimeUpdate = useCallback((e?: VideoEvent) => {
    if (!videoRef.current || !e) return
    setCurrentTime(e.target.currentTime)
    // Update buffered amount
    const bufferedRanges = e.target.buffered
    if (!bufferedRanges || bufferedRanges.length === 0) return
    const bufferedEnd = bufferedRanges.end(bufferedRanges.length - 1)
    setBuffered(bufferedEnd)
    // Fallback: Update duration if it's still 0 but video has duration
    if (duration === 0 && videoRef.current.duration > 0) {
      const videoDuration = videoRef.current.duration
      if (isFinite(videoDuration) && !isNaN(videoDuration)) {
        setDuration(videoDuration)
      }
    }
  }, [duration])

  const handleSeek = useCallback((e?: VideoEvent) => {
    if (!videoRef.current || !e) return
    setCurrentTime(e.target.currentTime)
  }, [])

  const handleVolumeChange = useCallback((e?: VideoEvent) => {
    if (!videoRef.current || !e) return
    setVolume(e.target.volume)
    setMuted(e.target.muted)
  }, [])

  const handleLoadedMetadata = useCallback((e?: VideoEvent) => {
    if (!videoRef.current || !e) return
    const duration = e.target.duration
    // Validate duration: must be a finite number and greater than 0
    if (isFinite(duration) && !isNaN(duration) && duration > 0) {
      setDuration(duration)
    } else if (videoRef.current.duration) {
      // Fallback to video element's duration if event duration is invalid
      const videoDuration = videoRef.current.duration
      if (isFinite(videoDuration) && !isNaN(videoDuration) && videoDuration > 0) {
        setDuration(videoDuration)
      }
    }
  }, [])

  const handleDurationChange = useCallback((e?: VideoEvent) => {
    if (!videoRef.current || !e) return
    const duration = e.target.duration
    // Validate duration: must be a finite number and greater than 0
    if (isFinite(duration) && !isNaN(duration) && duration > 0) {
      setDuration(duration)
    } else if (videoRef.current.duration) {
      // Fallback to video element's duration if event duration is invalid
      const videoDuration = videoRef.current.duration
      if (isFinite(videoDuration) && !isNaN(videoDuration) && videoDuration > 0) {
        setDuration(videoDuration)
      }
    }
  }, [])

  // Helper function to update duration from video element
  const updateDurationFromVideo = useCallback(() => {
    if (!videoRef.current) return
    const videoDuration = videoRef.current.duration
    if (isFinite(videoDuration) && !isNaN(videoDuration) && videoDuration > 0) {
      setDuration(videoDuration)
    }
  }, [])

  // Check duration when video ref becomes available (e.g., on reload)
  useEffect(() => {
    if (!videoRef.current) return
    
    // Check immediately if duration is already available
    updateDurationFromVideo()

    const controller = new AbortController()
    const { signal } = controller
    
    // Also check when video is ready (in case it's still loading)
    const checkDuration = () => {
      const video = videoRef.current
      if (video && video.readyState >= 1 && !signal.aborted) {
        updateDurationFromVideo()
      }
    }
    
    const video = videoRef.current
    video.addEventListener("canplay", checkDuration, { signal })
    video.addEventListener("loadeddata", checkDuration, { signal })
    
    return () => controller.abort()
  }, [updateDurationFromVideo, videoRef])

  useEffect(() => {
    if (!videoRef.current) return
    const controller = new AbortController()
    const { signal } = controller
    const video = videoRef.current

    // Type-safe event handlers that convert native events to VideoEvent
    const createVideoEvent = (e: Event): VideoEvent => {
      return e as unknown as VideoEvent
    }

    const playHandler = (e: Event) => handlePlay(createVideoEvent(e))
    const pauseHandler = (e: Event) => handlePause(createVideoEvent(e))
    const endedHandler = (e: Event) => handleEnded(createVideoEvent(e))
    const errorHandler = (e: Event) => handleError(createVideoEvent(e))
    const canPlayHandler = (e: Event) => handleCanPlay(createVideoEvent(e))
    const canPlayThroughHandler = (e: Event) => handleCanPlayThrough(createVideoEvent(e))
    const timeUpdateHandler = (e: Event) => handleTimeUpdate(createVideoEvent(e))
    const volumeChangeHandler = (e: Event) => handleVolumeChange(createVideoEvent(e))
    const loadedMetadataHandler = (e: Event) => handleLoadedMetadata(createVideoEvent(e))
    const durationChangeHandler = (e: Event) => handleDurationChange(createVideoEvent(e))
    const seekedHandler = (e: Event) => handleSeek(createVideoEvent(e))

    video.addEventListener("play", playHandler, { signal })
    video.addEventListener("pause", pauseHandler, { signal })
    video.addEventListener("ended", endedHandler, { signal })
    video.addEventListener("error", errorHandler, { signal })
    video.addEventListener("seeked", seekedHandler, { signal })
    video.addEventListener("canplay", canPlayHandler, { signal })
    video.addEventListener("canplaythrough", canPlayThroughHandler, { signal })
    video.addEventListener("timeupdate", timeUpdateHandler, { signal })
    video.addEventListener("volumechange", volumeChangeHandler, { signal })
    video.addEventListener("loadedmetadata", loadedMetadataHandler, { signal })
    video.addEventListener("durationchange", durationChangeHandler, { signal })

    // Check duration immediately after setting up listeners (for reload scenarios)
    updateDurationFromVideo()

    return () => controller.abort()
  }, [handlePlay, handlePause, handleEnded, handleError, handleSeek, handleCanPlay, handleCanPlayThrough, handleTimeUpdate, handleVolumeChange, handleLoadedMetadata, handleDurationChange, updateDurationFromVideo])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    // Also listen for webkit fullscreen (Safari)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  // Handle picture in picture changes
  useEffect(() => {
    if (!videoRef.current) return
    const handlePictureInPictureChange = () => {
      setIsPictureInPicture(!!document.pictureInPictureElement)
    }

    const controller = new AbortController()
    const { signal } = controller

    videoRef.current.addEventListener("enterpictureinpicture", handlePictureInPictureChange, { signal })
    videoRef.current.addEventListener("leavepictureinpicture", handlePictureInPictureChange, { signal })
    return () => controller.abort()
  }, [videoRef])

  const value = useMemo<VideoContextProps>(() => ({
    videoRef,
    containerRef,
    focused,
    setFocused,
    isFullscreen,
    setIsFullscreen,
    isPictureInPicture,
    setIsPictureInPicture,
    state: videoState,
    setState: setVideoState,
    volume,
    setVolume,
    muted,
    setMuted,
    canPlay,
    setCanPlay,
    canPlayThrough,
    setCanPlayThrough,
    playbackRate,
    setPlaybackRate,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    buffered,
    setBuffered,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleFocus,
    handleBlur,
    handleSeek,
    handleCanPlay,
    handleCanPlayThrough,
    handleTimeUpdate,
    handleVolumeChange,
    handleLoadedMetadata,
    handleDurationChange,
    handleKeyDown,
    toggleVideoState,
    toggleFullscreen,
    togglePictureInPicture,
  }), [videoRef, containerRef, focused, isFullscreen, isPictureInPicture, videoState, volume, muted, canPlay, canPlayThrough, playbackRate, currentTime, duration, buffered, handlePlay, handlePause, handleEnded, handleError, handleSeek, handleFocus, handleBlur, handleCanPlay, handleCanPlayThrough, handleTimeUpdate, handleVolumeChange, handleLoadedMetadata, handleDurationChange, handleKeyDown, toggleVideoState, toggleFullscreen, togglePictureInPicture])

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  )
}