import { useEffect, useState } from "react"

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = () => setMatches(media.matches)

    const controller = new AbortController()
    const { signal } = controller
    media.addEventListener("change", listener, { signal })
    
    return () => controller.abort()
  }, [query])

  return matches
}