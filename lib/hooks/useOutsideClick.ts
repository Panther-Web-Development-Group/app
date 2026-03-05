import { useEffect, useState } from "react"

export const useOutsideClick = (ref: React.RefObject<HTMLElement>) => {
  const [isOutside, setIsOutside] = useState(false)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOutside(true)
      }
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("click", handleClick, { signal })

    return () => controller.abort()
  }, [ref])

  return isOutside
}