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
  AudioContextProps, 
  AudioProviderProps,
  AudioState,
  AudioEvent,
} from "./types"

export const AudioContext = createContext<AudioContextProps | null>(null)

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error("useAudioContext must be used within an AudioProvider")
  return context
}

export const AudioProvider: FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioState, setAudioState] = useState<AudioState>("loading")
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [canPlay, setCanPlay] = useState(false)
  const [canPlayThrough, setCanPlayThrough] = useState(false)
  const [focused, setFocused] = useState(false)

  const handlePlay = useCallback((e?: AudioEvent) => {
    setAudioState("playing")
  }, [])

  const handlePause = useCallback((e?: AudioEvent) => {
    setAudioState("paused")
  }, [])

  const handleEnded = useCallback((e?: AudioEvent) => {
    setAudioState("ended")
  }, [])

  const handleError = useCallback((e?: AudioEvent) => {
    setAudioState("error")
  }, [])

  const handleFocus = useCallback((e?: AudioEvent) => {
    setFocused(true)
  }, [])

  const handleBlur = useCallback((e?: AudioEvent) => {
    setFocused(false)
  }, [])

  const toggleAudioState = useCallback(() => {
    if (!audioRef.current) return
    if (audioState === "playing") {
      audioRef.current.pause()
      handlePause()
    } else {
      audioRef.current.play()
      handlePlay()
    }
  }, [audioState, handlePlay, handlePause])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!audioRef.current || !focused) return

    switch (e.key) {
      case " ":
        e.preventDefault()
        toggleAudioState()
        break
      case "ArrowLeft":
        e.preventDefault()
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5)
          setCurrentTime(audioRef.current.currentTime)
        }
        break
      case "ArrowRight":
        e.preventDefault()
        if (audioRef.current) {
          const newTime = Math.min(duration, audioRef.current.currentTime + 5)
          audioRef.current.currentTime = newTime
          setCurrentTime(newTime)
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (audioRef.current) {
          const newVolume = Math.min(1, audioRef.current.volume + 0.1)
          audioRef.current.volume = newVolume
          setVolume(newVolume)
          if (muted && newVolume > 0) {
            audioRef.current.muted = false
            setMuted(false)
          }
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (audioRef.current) {
          const newVolume = Math.max(0, audioRef.current.volume - 0.1)
          audioRef.current.volume = newVolume
          setVolume(newVolume)
          if (newVolume === 0) {
            audioRef.current.muted = true
            setMuted(true)
          }
        }
        break
      case "m":
      case "M":
        e.preventDefault()
        if (audioRef.current) {
          const newMuted = !muted
          audioRef.current.muted = newMuted
          setMuted(newMuted)
        }
        break
    }
  }, [focused, duration, muted, toggleAudioState, setCurrentTime, setVolume, setMuted])

  const handleCanPlay = useCallback((e?: AudioEvent) => {
    setCanPlay(true)
  }, [])

  const handleCanPlayThrough = useCallback((e?: AudioEvent) => {
    setCanPlayThrough(true)
  }, [])

  const handleTimeUpdate = useCallback((e?: AudioEvent) => {
    if (!audioRef.current || !e) return
    setCurrentTime(e.target.currentTime)
    // Update buffered amount
    const bufferedRanges = e.target.buffered
    if (!bufferedRanges || bufferedRanges.length === 0) return
    const bufferedEnd = bufferedRanges.end(bufferedRanges.length - 1)
    setBuffered(bufferedEnd)
    // Fallback: Update duration if it's still 0 but audio has duration
    if (duration === 0 && audioRef.current.duration > 0) {
      const audioDuration = audioRef.current.duration
      if (isFinite(audioDuration) && !isNaN(audioDuration)) {
        setDuration(audioDuration)
      }
    }
  }, [duration])

  const handleSeek = useCallback((e?: AudioEvent) => {
    if (!audioRef.current || !e) return
    setCurrentTime(e.target.currentTime)
  }, [])

  const handleVolumeChange = useCallback((e?: AudioEvent) => {
    if (!audioRef.current || !e) return
    setVolume(e.target.volume)
    setMuted(e.target.muted)
  }, [])

  const handleLoadedMetadata = useCallback((e?: AudioEvent) => {
    if (!audioRef.current || !e) return
    const duration = e.target.duration
    // Validate duration: must be a finite number and greater than 0
    if (isFinite(duration) && !isNaN(duration) && duration > 0) {
      setDuration(duration)
    } else if (audioRef.current.duration) {
      // Fallback to audio element's duration if event duration is invalid
      const audioDuration = audioRef.current.duration
      if (isFinite(audioDuration) && !isNaN(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration)
      }
    }
  }, [])

  const handleDurationChange = useCallback((e?: AudioEvent) => {
    if (!audioRef.current || !e) return
    const duration = e.target.duration
    // Validate duration: must be a finite number and greater than 0
    if (isFinite(duration) && !isNaN(duration) && duration > 0) {
      setDuration(duration)
    } else if (audioRef.current.duration) {
      // Fallback to audio element's duration if event duration is invalid
      const audioDuration = audioRef.current.duration
      if (isFinite(audioDuration) && !isNaN(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration)
      }
    }
  }, [])

  // Helper function to update duration from audio element
  const updateDurationFromAudio = useCallback(() => {
    if (!audioRef.current) return
    const audioDuration = audioRef.current.duration
    if (isFinite(audioDuration) && !isNaN(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration)
    }
  }, [])

  // Check duration when audio ref becomes available (e.g., on reload)
  useEffect(() => {
    if (!audioRef.current) return
    
    // Check immediately if duration is already available
    updateDurationFromAudio()

    const controller = new AbortController()
    const { signal } = controller
    
    // Also check when audio is ready (in case it's still loading)
    const checkDuration = () => {
      const audio = audioRef.current
      if (audio && audio.readyState >= 1 && !signal.aborted) {
        updateDurationFromAudio()
      }
    }
    
    const audio = audioRef.current
    audio.addEventListener("canplay", checkDuration, { signal })
    audio.addEventListener("loadeddata", checkDuration, { signal })
    
    return () => controller.abort()
  }, [updateDurationFromAudio, audioRef])

  useEffect(() => {
    if (!audioRef.current) return
    const controller = new AbortController()
    const { signal } = controller
    const audio = audioRef.current

    // Type-safe event handlers that convert native events to AudioEvent
    const createAudioEvent = (e: Event): AudioEvent => {
      return e as unknown as AudioEvent
    }

    const playHandler = (e: Event) => handlePlay(createAudioEvent(e))
    const pauseHandler = (e: Event) => handlePause(createAudioEvent(e))
    const endedHandler = (e: Event) => handleEnded(createAudioEvent(e))
    const errorHandler = (e: Event) => handleError(createAudioEvent(e))
    const canPlayHandler = (e: Event) => handleCanPlay(createAudioEvent(e))
    const canPlayThroughHandler = (e: Event) => handleCanPlayThrough(createAudioEvent(e))
    const timeUpdateHandler = (e: Event) => handleTimeUpdate(createAudioEvent(e))
    const volumeChangeHandler = (e: Event) => handleVolumeChange(createAudioEvent(e))
    const loadedMetadataHandler = (e: Event) => handleLoadedMetadata(createAudioEvent(e))
    const durationChangeHandler = (e: Event) => handleDurationChange(createAudioEvent(e))
    const seekedHandler = (e: Event) => handleSeek(createAudioEvent(e))

    audio.addEventListener("play", playHandler, { signal })
    audio.addEventListener("pause", pauseHandler, { signal })
    audio.addEventListener("ended", endedHandler, { signal })
    audio.addEventListener("error", errorHandler, { signal })
    audio.addEventListener("seeked", seekedHandler, { signal })
    audio.addEventListener("canplay", canPlayHandler, { signal })
    audio.addEventListener("canplaythrough", canPlayThroughHandler, { signal })
    audio.addEventListener("timeupdate", timeUpdateHandler, { signal })
    audio.addEventListener("volumechange", volumeChangeHandler, { signal })
    audio.addEventListener("loadedmetadata", loadedMetadataHandler, { signal })
    audio.addEventListener("durationchange", durationChangeHandler, { signal })

    // Check duration immediately after setting up listeners (for reload scenarios)
    updateDurationFromAudio()

    return () => controller.abort()
  }, [handlePlay, handlePause, handleEnded, handleError, handleSeek, handleCanPlay, handleCanPlayThrough, handleTimeUpdate, handleVolumeChange, handleLoadedMetadata, handleDurationChange, updateDurationFromAudio])

  const value = useMemo<AudioContextProps>(() => ({
    audioRef,
    focused,
    setFocused,
    state: audioState,
    setState: setAudioState,
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
    toggleAudioState,
  }), [audioRef, focused, audioState, volume, muted, canPlay, canPlayThrough, playbackRate, currentTime, duration, buffered, handlePlay, handlePause, handleEnded, handleError, handleSeek, handleFocus, handleBlur, handleCanPlay, handleCanPlayThrough, handleTimeUpdate, handleVolumeChange, handleLoadedMetadata, handleDurationChange, handleKeyDown, toggleAudioState])

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}
