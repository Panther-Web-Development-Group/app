import {
  useState,
  useEffect,
  useCallback,
  RefObject,
  useRef
} from "react"

type UseScrollOptions = {
  /** When true, listen globally on document. When false, only when ref element is focused. */
  global?: boolean
}

type UseScrollDispatch = () => void

export function useScroll(ref?: RefObject<HTMLElement | null>, options: UseScrollOptions = {}) {
  const effectiveGlobal = options.global ?? !ref
  const [position, setPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const positionRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleScroll = useCallback((event: Event) => {
    const el = ref?.current
    if (!effectiveGlobal && el) {
      const target = event.target as Node
      if (!el.contains(target)) return

      const nextPosition = {
        x: el.scrollLeft,
        y: el.scrollTop
      }

      positionRef.current = nextPosition

      setPosition(nextPosition)
    }
  }, [effectiveGlobal, ref])

  useEffect(() => {
    const target = document

    const controller = new AbortController()
    const { signal } = controller

    target.addEventListener("scroll", handleScroll, { signal })

    return () => controller.abort()
  }, [handleScroll])

  return { position }
}