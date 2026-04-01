import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type RefObject,
} from "react"

type UseKeyboardOptions = {
  /** When true, listen globally on document. When false, only when ref element is focused. */
  global?: boolean
}

type UseKeyboardDispatch = () => void

function normalizeKey(key: string): string {
  const k = key.toLowerCase()
  const map: Record<string, string> = {
    " ": "space",
    arrowup: "arrowup",
    arrowdown: "arrowdown",
    arrowleft: "arrowleft",
    arrowright: "arrowright",
  }
  return map[k] ?? k
}

function normalizeCombo(keys: string[]): string {
  return [...keys].map(normalizeKey).sort().join("+")
}

export function useKeyboard(
  ref?: RefObject<HTMLElement | null>,
  options: UseKeyboardOptions = {}
) {
  const effectiveGlobal = options.global ?? !ref
  const [keys, setKeys] = useState<string[]>([])
  const keysRef = useRef<string[]>([])
  const registryRef = useRef<Map<string, UseKeyboardDispatch>>(new Map())

  const unregister = useCallback((combo: string[]) => {
    const id = normalizeCombo(combo)
    registryRef.current.delete(id)
  }, [])

  const register = useCallback((combo: string[], callback: UseKeyboardDispatch) => {
    const id = normalizeCombo(combo)
    registryRef.current.set(id, callback)
    return () => unregister(combo)
  }, [unregister])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const el = ref?.current
      if (!effectiveGlobal && el) {
        const target = event.target as Node
        if (!el.contains(target)) return
      }

      const key = event.key
      if (keysRef.current.includes(key)) return

      const nextKeys = [...keysRef.current, key]
      keysRef.current = nextKeys
      setKeys(nextKeys)

      const id = normalizeCombo(nextKeys)
      const callback = registryRef.current.get(id)
      if (callback) {
        event.preventDefault()
        callback()
      }
    },
    [effectiveGlobal, ref]
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const el = ref?.current
      if (!effectiveGlobal && el) {
        const target = event.target as Node
        if (!el.contains(target)) return
      }

      const key = event.key
      if (!keysRef.current.includes(key)) return

      keysRef.current = keysRef.current.filter((k) => k !== key)
      setKeys(keysRef.current)
    },
    [effectiveGlobal, ref]
  )

  useEffect(() => {
    const target = document

    const controller = new AbortController()
    const { signal } = controller

    target.addEventListener("keydown", handleKeyDown, { signal })
    target.addEventListener("keyup", handleKeyUp, { signal })

    return () => controller.abort()
  }, [handleKeyDown, handleKeyUp])

  return { register, unregister, keys }
}
